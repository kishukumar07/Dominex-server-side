//this msg controller is for development purpose only ..

import MsgModel from "../models/message.models.model.js";

// Helper to validate MongoDB ObjectId (if using MongoDB)
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  // Check for missing fields
  if (!senderId || !receiverId || typeof content !== "string") {
    return res.status(400).json({
      success: false,
      msg: "Request body must contain senderId, receiverId, and content.",
    });
  }

  // Prevent sending message to self
  if (senderId === receiverId) {
    return res.status(400).json({
      success: false,
      msg: "Sender and receiver cannot be the same user.",
    });
  }

  // Validate ObjectIds
  if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid senderId or receiverId.",
    });
  }

  // Prevent empty messages
  if (!content.trim()) {
    return res.status(400).json({
      success: false,
      msg: "Message content cannot be empty.",
    });
  }

  try {
    const message = await MsgModel.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });
    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: "Failed to send message" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Check for missing params
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        msg: "Url should contain both userId1 and userId2",
      });
    }

    // Validate ObjectIds
    if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid userId1 or userId2.",
      });
    }

    // Prevent fetching messages with self
    if (userId1 === userId2) {
      return res.status(400).json({
        success: false,
        msg: "Cannot fetch messages between the same user.",
      });
    }

    const messages = await MsgModel.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort("timestamp");

    // No messages found
    if (!messages.length) {
      return res.status(404).json({
        success: false,
        msg: "No messages found between these users.",
      });
    }

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch messages", details: err.message });
  }
};

export { getMessages, sendMessage };
