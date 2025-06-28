import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getUserStories,
} from "../controllers/storyController.js";

// Create a story
router.post("/", authenticate, upload.single("media"), createStory);

// Get all stories
router.get("/", authenticate, getAllStories);

// Get a specific story
router.get("/:id", authenticate, getStoryById);

// Update a story
router.patch("/:id", authenticate, updateStory); //for view purpose ...

// Delete a story
router.delete("/:id", authenticate, deleteStory);

// Get all stories by a user
router.get("/user/:userId", authenticate, getUserStories);

export default router;
