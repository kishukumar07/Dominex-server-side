import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/auth.middleware.js";

import {
  createComment,
  createReplyComment,
  updateComment,
  deleteComment,
  getCommentById,
  getAllComments,
} from "../controllers/commentController.js";

//Create a comment
router.post("/", authenticate, createComment);

//create a nested comment
router.post("/:id/reply", authenticate, createReplyComment);

// Update a comment
router.put("/:id", authenticate, updateComment);

// Delete a comment
router.delete("/:id", authenticate, deleteComment); //also being deleted from parent comment list ..have to do this task ...

// Get a single comment
router.get("/:id", authenticate, getCommentById);

// get all comments for a post including nested )
router.get("/post/:postId", authenticate, getAllComments); //want only top level comments with nested comment...

export default router;
