// import mongoose from "mongoose";
import PostModel from "../models/post.models.model.js";
import UserModel from "../models/user.models.model.js";
import uploadOnCloudinary from "../utils/media/Upload.on.Cloudinary.js";
import mongoose from "mongoose";

const createPost = async (req, res) => {
  try {
    if (!req.file || req.title) {
      return res.status(400).json({ error: "No file or Title uploaded" });
    }
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (!uploaded || !uploaded.url) {
      return res.status(500).json({ error: "Failed to upload image" });
    }
    // console.log(uploaded.url);
    // we will post this url in place of pics....
    const title = req.title;
    const photo = uploaded.url;
    const author = req.userId;

    // console.log(author, title, photo);

    const newPost = await PostModel.create({
      //author title photo likes Comment
      author,
      title,
      photo,
    });

    // console.log(newPost);
    await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $push: { posts: newPost._id },
      },
      { new: true },
    );

    return res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    // Default values for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalPosts = await PostModel.countDocuments();

    // Fetch posts with pagination, newest first
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id name username profilePic") //adjust fields as needed
      .populate("likes", "profilePic username");

    res.status(200).json({
      data: posts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}; //pagination

const getPostById = async (req, res) => {
  const post_Id = req.params.id;

  if (!post_Id) {
    return res.status(400).json({
      success: false,
      msg: "postId not provided",
    });
  }

  // Validate if post_Id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(post_Id)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid postId format",
    });
  }

  try {
    const post = await PostModel.aggregate([
      // 1. Match the post
      { $match: { _id: new mongoose.Types.ObjectId(post_Id) } },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

      // 2. Lookup top-level comments
      {
        $lookup: {
          from: "comments",
          localField: "comment",
          foreignField: "_id",
          as: "comments",
        },
      },

      // 3. Unwind comments
      { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },

      // 4. Lookup comment author
      {
        $lookup: {
          from: "users",
          localField: "comments.author",
          foreignField: "_id",
          as: "comments.author",
        },
      },
      {
        $unwind: { path: "$comments.author", preserveNullAndEmptyArrays: true },
      },

      // 5. graphLookup — recursive subcomments from same comments collection
      {
        $graphLookup: {
          from: "comments",
          startWith: "$comments.subComment",
          connectFromField: "subComment",
          connectToField: "_id",
          as: "comments.allSubComments",
          maxDepth: 5,
          depthField: "depth",
        },
      },

      // 6. Unwind subcomments
      {
        $unwind: {
          path: "$comments.allSubComments",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 7. Lookup subcomment author
      {
        $lookup: {
          from: "users",
          localField: "comments.allSubComments.author",
          foreignField: "_id",
          as: "comments.allSubComments.author",
        },
      },
      {
        $unwind: {
          path: "$comments.allSubComments.author",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 8. Re-group subcomments back into each comment
      {
        $group: {
          _id: {
            postId: "$_id",
            commentId: "$comments._id",
          },
          root: { $first: "$$ROOT" },
          comment: { $first: "$comments" },
          allSubComments: {
            $push: {
              $cond: {
                if: { $ifNull: ["$comments.allSubComments._id", false] },
                then: "$comments.allSubComments",
                else: "$$REMOVE",
              },
            },
          },
        },
      },

      // 9. Attach subcomments back to comment
      {
        $addFields: {
          "comment.allSubComments": "$allSubComments",
        },
      },

      // 10. Re-group all comments back into post
      {
        $group: {
          _id: "$_id.postId",
          root: { $first: "$root" },
          comments: { $push: "$comment" },
        },
      },

      // 11. Attach comments to root
      {
        $addFields: {
          "root.comments": "$comments",
        },
      },

      // 12. Replace root
      { $replaceRoot: { newRoot: "$root" } },

      // 13. Final project — shape everything cleanly here
      {
        $project: {
          _id: 1,
          title: 1,
          photo: 1,
          likes: 1,
          createdAt: 1,
          author: {
            _id: 1,
            name: 1,
            username: 1,
            profilePic: 1,
          },
          comments: {
            _id: 1,
            content: 1,
            likes: 1,
            createdAt: 1,
            author: {
              _id: 1,
              name: 1,
              username: 1,
              profilePic: 1,
            },
            allSubComments: {
              _id: 1,
              content: 1,
              likes: 1,
              parentComment: 1,
              depth: 1,
              createdAt: 1,
              author: {
                _id: 1,
                name: 1,
                username: 1,
                profilePic: 1,
              },
            },
          },
        },
      },
    ]);

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

const getUserPosts = async (req, res) => {
  const u_id = req.params.userId;

  if (!u_id) {
    return res.status(400).json({ msg: "userId not provided" });
  }
  // Validate if post_Id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(u_id)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid postId format",
    });
  }

  try {
    const userPosts = await PostModel.find({ author: u_id });

    if (userPosts.length === 0) {
      return res
        .status(404)
        .json({ success: false, msg: "User Post Not Available" });
    }

    return res.status(200).json({ success: true, data: userPosts });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post_Id = req.params.id;
    const userId = req.userId;

    if (!post_Id || !mongoose.Types.ObjectId.isValid(post_Id)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid PostID",
      });
    }

    const post = await PostModel.findById(post_Id);
    // Check if Post Exists.
    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Post not founded",
      });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    const response = await post.save();

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

//authorized routes
const updatePost = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;
  const { title } = req.body;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, msg: "Invalid postId" });
  }

  if (!title) {
    return res.status(400).json({ success: false, msg: "Title is required" });
  }

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    // Authorization: only author can update

    if (!post.author.equals(userId)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    post.title = title;
    const updatedPost = await post.save();

    return res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

const deletePost = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, msg: "Invalid postId" });
  }

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    // Authorization: only author can delete
    if (!post.author.equals(userId)) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    await PostModel.findByIdAndDelete(postId);

    return res
      .status(200)
      .json({ success: true, msg: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getUserPosts,
};
