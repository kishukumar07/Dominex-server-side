import { Router } from "express";
const router = Router();

import {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByPostId,
} from "../controllers/commentController.js";

// Create a comment
router.post("/", createComment);

// Get all comments
router.get("/", getAllComments);

// Get a single comment
router.get("/:id", getCommentById);

// Update a comment
router.put("/:id", updateComment);

// Delete a comment
router.delete("/:id", deleteComment);

// Get all comments on a specific post
router.get("/post/:postId", getCommentsByPostId);

export default router;
