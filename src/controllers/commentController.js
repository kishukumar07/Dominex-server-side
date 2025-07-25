import CommentModel from "../models/comment.models.model.js";
import PostModel from "../models/post.models.model.js";
import mongoose from "mongoose";

// Create a comment on a post
const createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const author = req.userId;

    if (!content || !postId) {
      return res
        .status(400)
        .json({ success: false, msg: "Content and postId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, msg: "Invalid postId" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, msg: "Post not found" });
    }

    const comment = await CommentModel.create({
      author,
      content,
      post: postId,
      subComment: [],
    });

    // Add comment to post's comment array
    post.comment.push(comment._id);
    await post.save();

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Create a reply to a comment (nested comment)
const createReplyComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: parentCommentId } = req.params;
    const author = req.userId;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, msg: "Content is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid parent comment id" });
    }

    const parentComment = await CommentModel.findById(parentCommentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({ success: false, msg: "Parent comment not found" });
    }

    const reply = await CommentModel.create({
      author,
      content,
      parentComment: parentCommentId,
      subComment: [],
    });

    if (!parentComment.subComment) {
      parentComment.subComment = [];
    }
    parentComment.subComment.push(reply._id);

    await parentComment.save();

    res.status(201).json({ success: true, data: reply });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

//REMAINING TESTING .....

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid comment id" });
    }

    const comment = await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, msg: "Comment not found" });
    }
    //authorization
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ success: false, msg: "Not authorized" });
    }

    if (content) comment.content = content;
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid comment id" });
    }

    const comment = await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, msg: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ success: false, msg: "Not authorized" });
    }

    // Remove comment from post's comment array
    await PostModel.updateOne(
      { _id: comment.post },
      { $pull: { comment: comment._id } }
    );

    await comment.deleteOne();

    res.status(200).json({ success: true, msg: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Get a single comment by id
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid comment id" });
    }

    const comment = await CommentModel.findById(id)
      .populate("author", "username")
      .populate("subComment");
    if (!comment) {
      return res.status(404).json({ success: false, msg: "Comment not found" });
    }

    res.status(200).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Get all comments for a post (including nested)
const getAllComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, msg: "Invalid postId" });
    }

    const comments = await CommentModel.find({
      post: postId,
      parentComment: null,
    }) // assuming top-level comments have no parent
      .populate("author", "username")
      .populate({
        path: "subComment",
        populate: [
          { path: "author", select: "username" },
          {
            path: "subComment",
            populate: { path: "author", select: "username" }, // 2nd level of nesting
          },
        ],
      })
      .lean();

    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

export {
  createComment,
  createReplyComment,
  updateComment,
  deleteComment,
  getCommentById,
  getAllComments,
};
