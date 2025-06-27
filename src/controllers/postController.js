import mongoose from "mongoose";
import PostModel from "../models/post.models.model.js";
import uploadOnCloudinary from "../utils/media/Upload.on.Cloudinary.js";

const createPost = async (req, res) => {
  try {
    // console.log(req.file);
    // need to check
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const uploaded = await uploadOnCloudinary(req.file.path);
    // console.log(uploaded.url);
    // we will post this url in place of pics....
    const photo = uploaded.url;
    const author = req.userId;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newPost = await PostModel.create({
      //author title photo likes Comment
      author,
      title,
      photo,
    });
    // console.log(newPost);
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalPosts = await PostModel.countDocuments();

    // Fetch posts with pagination, newest first
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username email"); //adjust fields as needed

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
    const post = await PostModel.findById(post_Id);

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

const toggleLike = () => {};

//authorized routes
const updatePost = () => {};
const deletePost = () => {};

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getUserPosts,
};
