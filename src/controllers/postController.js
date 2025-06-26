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


const getAllPosts = () => {};
const getPostById = () => {};
const toggleLike = () => {};
const getUserPosts = () => {};

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
