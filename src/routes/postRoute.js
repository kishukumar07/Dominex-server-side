import { Router } from "express";
const router = Router();
import upload from "../middlewares/multer.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
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
router.post("/", authenticate, upload.single("image"), createPost); //authentication only

// Get all posts
router.get("/", authenticate, getAllPosts);
// Get single post
router.get("/:id", authenticate, getPostById);

// Get all posts of a user
router.get("/user/:userId", getUserPosts);

//authorizized Routes ...

// Update post
router.put("/:id", authenticate, updatePost);

// Delete post
router.delete("/:id", authenticate, deletePost);

// Like/Unlike a post
router.put("/:id/like", authenticate, toggleLike);

export default router;
