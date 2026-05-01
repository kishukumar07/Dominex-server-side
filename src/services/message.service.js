// Professional message service layer shared by both HTTP and Socket


import MsgModel from "../models/message.models.model.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Save a new message to the database.
 * Used by both Socket (live send) and HTTP controller.
 *
 * @returns { success, message, error }
 */
export const saveMessage = async ({ senderId, receiverId, content }) => {
  if (!senderId || !receiverId || typeof content !== "string") {
    return { success: false, error: "Missing senderId, receiverId, or content." };
  }

  if (senderId === receiverId) {
    return { success: false, error: "Sender and receiver cannot be the same." };
  }

  if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
    return { success: false, error: "Invalid senderId or receiverId." };
  }

  if (!content.trim()) {
    return { success: false, error: "Message content cannot be empty." };
  }

  try {
    const message = await MsgModel.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });
    return { success: true, message };
  } catch (err) {
    console.error("saveMessage error:", err.message);
    return { success: false, error: "Failed to save message." };
  }
};

/**
 * Fetch conversation history between two users.
 * Supports cursor-based pagination for infinite scroll (load older messages).
 *
 * @param userId1 - string
 * @param userId2 - string
 * @param limit   - number of messages to fetch (default 30)
 * @param before  - ISO timestamp string — fetch messages older than this (for scroll-up)
 *
 * @returns { success, messages, hasMore, error }
 */
export const getConversation = async (userId1, userId2, limit = 30, before = null) => {
  if (!userId1 || !userId2) {
    return { success: false, error: "Both user IDs are required." };
  }

  if (userId1 === userId2) {
    return { success: false, error: "Cannot fetch messages with the same user." };
  }

  if (!isValidObjectId(userId1) || !isValidObjectId(userId2)) {
    return { success: false, error: "Invalid user IDs." };
  }

  try {
    const query = {
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    };

    // Cursor: if 'before' timestamp provided, fetch only messages older than it
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const safeLimit = Math.min(parseInt(limit) || 30, 100); // cap at 100

    // Fetch one extra to know if there are more pages
    const messages = await MsgModel.find(query)
      .sort({ timestamp: -1 })   // newest first from DB
      .limit(safeLimit + 1)
      .lean();

    const hasMore = messages.length > safeLimit;
    if (hasMore) messages.pop(); // remove the extra one

    messages.reverse(); // return in chronological order to the client

    return { success: true, messages, hasMore };
  } catch (err) {
    console.error("getConversation error:", err.message);
    return { success: false, error: "Failed to fetch messages." };
  }
};

/**
 * Mark all messages in a conversation as seen.
 * Call this when the receiver joins/opens the room.
 *
 * @returns { success, updatedCount, error }
 */
export const markMessagesAsSeen = async (senderId, receiverId) => {
  if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
    return { success: false, error: "Invalid IDs." };
  }

  try {
    const result = await MsgModel.updateMany(
      { sender: senderId, receiver: receiverId, seen: false },
      { $set: { seen: true } }
    );
    return { success: true, updatedCount: result.modifiedCount };
  } catch (err) {
    console.error("markMessagesAsSeen error:", err.message);
    return { success: false, error: "Failed to mark messages as seen." };
  }
};