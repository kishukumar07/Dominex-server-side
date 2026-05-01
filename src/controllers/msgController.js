// src/controllers/msgController.js
// HTTP layer only — all DB logic lives in message.service.js

import { getConversation } from "../services/message.service.js";

/**
 * GET /api/messages/:userId1/:userId2
 * Fetch paginated conversation history between two users.
 *
 * Query params:
 *   limit  - number of messages (default 30, max 100)
 *   before - ISO timestamp for cursor-based pagination (load older messages on scroll)
 *
 * Example:
 *   First load:   GET /messages/userA/userB
 *   Scroll up:    GET /messages/userA/userB?before=2024-01-15T10:00:00.000Z
 */
export const getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;
  const { limit, before } = req.query;

  // Authorization: a user can only fetch their own conversations
  if (req.userId !== userId1 && req.userId !== userId2) {
    return res.status(403).json({ success: false, msg: "Not authorized to view this conversation." });
  }

  const result = await getConversation(userId1, userId2, limit, before);

  if (!result.success) {
    return res.status(400).json({ success: false, msg: result.error });
  }

  return res.status(200).json({
    success: true,
    messages: result.messages,
    hasMore: result.hasMore,
  });
};