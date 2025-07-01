// msgController.js (Socket-compatible version)
import MsgModel from "../models/message.models.model.js";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Send a message between two users
 * @param {Object} params
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.message
 * @returns {Object} savedMessage
 */
const sendMessage = async ({ senderId, receiverId, message }) => {
  if (!senderId || !receiverId || typeof message !== "string") {
    throw new Error("Missing or invalid senderId, receiverId, or message.");
  }

  if (senderId === receiverId) {
    throw new Error("Sender and receiver cannot be the same.");
  }

  if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
    throw new Error("Invalid senderId or receiverId.");
  }

  if (!message.trim()) {
    throw new Error("Message content cannot be empty.");
  }

  try {
    const savedMessage = await MsgModel.create({
      sender: senderId,
      receiver: receiverId,
      content: message.trim(),
    });

    return savedMessage;
  } catch (error) {
    throw new Error("Failed to save message.");
  }
};

/**
 * Get all messages between two users
 * @param {string} userId1
 * @param {string} userId2
 * @returns {Array} messages
 */
const getMessages = async (userId1, userId2) => {
  if (!userId1 || !userId2) {
    throw new Error("Both userId1 and userId2 are required.");
  }

  if (userId1 === userId2) {
    throw new Error("Cannot fetch messages with the same user.");
  }

  if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
    throw new Error("Invalid userId1 or userId2.");
  }

  try {
    const messages = await MsgModel.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort("timestamp");
    // console.log(messages);
    return messages;
  } catch (error) {
    throw new Error("Failed to fetch messages.");
  }
};

export { sendMessage, getMessages };
