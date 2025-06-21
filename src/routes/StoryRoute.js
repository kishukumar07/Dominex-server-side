import { Router } from "express";
const router = Router();

import {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getUserStories,
} from "../controllers/storyController.js";

// Create a story
router.post("/", createStory);

// Get all stories
router.get("/", getAllStories);

// Get a specific story
router.get("/:id", getStoryById);

// Update a story
router.put("/:id", updateStory);

// Delete a story
router.delete("/:id", deleteStory);

// Get all stories by a user
router.get("/user/:userId", getUserStories);

export default router;
