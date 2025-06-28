import StoryModel from "../models/story.models.model.js";
import uploadOnCloudinary from "../utils/media/Upload.on.Cloudinary.js";

const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (!uploaded || !uploaded.url) {
      return res.status(500).json({ error: "Failed to upload media" });
    }
    // Ensure req.userId is set (should be set by authentication middleware)
    const author = req.userId;
    // console.log(uploaded.url, author);
    if (!author) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }
    const mediaUrl = uploaded.url;
    let { caption } = req.body;
    if (!caption) {
      caption = "";
    }
    // Ensure StoryModel is connected to the database and schema is correct
    const newStory = await StoryModel.create({
      author,
      mediaUrl,
      caption,
    });

    res.status(201).json({
      success: true,
      data: newStory,
    });
  } catch (err) {
    console.error("Error creating story:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllStories = async (req, res) => {
  try {
    const stories = await StoryModel.find().sort({ createdAt: 1 });

    if (!stories.length) {
      return res.status(404).json({ msg: "Stories not Founded" });
    }

    res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await StoryModel.findById(storyId);

    if (!story) {
      return res.status(404).json({ msg: "Story not found" });
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

const getUserStories = async (req, res) => {
  try {
    const authorId = req.params.userId;

    // console.log(authorId); 
    const stories = await StoryModel.find({ author: authorId }).sort({ createdAt: -1 });

    if (!stories || stories.length === 0) {
      return res.status(404).json({ msg: "No stories found for this user" });
    }

    res.status(200).json({
      success: true,
      data: stories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};


//authorized route ....
const updateStory = (req, res) => {
    

};




const deleteStory = () => {};

export {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getUserStories,
};
