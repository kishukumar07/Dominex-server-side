import { Router } from "express";
const router = Router();

import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  getUserPosts,
} from "../controllers/postController.js";

// Create post
router.post("/", createPost);

// Get all posts
router.get("/", getAllPosts);

// Get single post
router.get("/:id", getPostById);

// Update post
router.put("/:id", updatePost);

// Delete post
router.delete("/:id", deletePost);

// Like/Unlike a post
router.put("/:id/like", toggleLike);

// Get all posts of a user
router.get("/user/:userId", getUserPosts);

export default router;
