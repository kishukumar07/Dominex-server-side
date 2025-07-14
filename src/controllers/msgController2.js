// msgController.js (Socket-compatible version)
import MsgModel from "../models/message.models.model.js";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Send Message
const sendMessage = async ({ senderId, receiverId, message }) => {
  try {
    // Input validation
    if (!senderId || !receiverId || typeof message !== "string") {
      return {
        success: false,
        error: "Missing or invalid senderId, receiverId, or message.",
      };
    }

    if (senderId === receiverId) {
      return {
        success: false,
        error: "Sender and receiver cannot be the same.",
      };
    }

    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
      return { success: false, error: "Invalid senderId or receiverId." };
    }

    if (!message.trim()) {
      return { success: false, error: "Message content cannot be empty." };
    }

    // Save message
    const savedMessage = await MsgModel.create({
      sender: senderId,
      receiver: receiverId,
      content: message.trim(),
    });

    return { success: true, message: savedMessage };
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    return {
      success: false,
      error: "Internal server error while saving message.",
    };
  }
};

// ✅ Get Messages
const getMessages = async (userId1, userId2) => {
  try {
    if (!userId1 || !userId2) {
      return { success: false, error: "Both user IDs are required." };
    }

    if (userId1 === userId2) {
      return {
        success: false,
        error: "Cannot fetch messages with the same user.",
      };
    }

    if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
      return { success: false, error: "Invalid userId1 or userId2." };
    }

    const messages = await MsgModel.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort("timestamp");

    return { success: true, messages };
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    return {
      success: false,
      error: "Internal server error while fetching messages.",
    };
  }
};

export { sendMessage, getMessages };
