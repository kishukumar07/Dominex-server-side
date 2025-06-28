import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true, // Image or video link
    },
    caption: {
      type: String,
      maxlength: 300,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
const StoryModel = mongoose.model("Story", storySchema);
export default StoryModel;
