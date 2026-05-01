// src/sockets/socket.js

import { Server } from "socket.io";
import { saveMessage, getConversation, markMessagesAsSeen } from "../services/message.service.js";
import { isMutualFollow } from "../controllers/followController.js";
import getBotResponse from "../chatBot/botProvider.js";

const BOT_USER_ID = process.env.BOT_USER_ID; // never hardcode this

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ─── JOIN ROOM ────────────────────────────────────────────────────────────
    // Called when a user opens a chat window.
    // 1. Validates mutual follow (skipped for bot)
    // 2. Loads recent message history
    // 3. Marks incoming messages as seen
    socket.on("joinRoom", async ({ senderId, receiverId }) => {
      try {
        if (!senderId || !receiverId) {
          return socket.emit("error", "senderId and receiverId are required.");
        }

        const isBot = receiverId === BOT_USER_ID;
        const roomId = [senderId, receiverId].sort().join("_");

        socket.join(roomId);

        // For real user-to-user chat, enforce mutual follow
        if (!isBot) {
          const mutual = await isMutualFollow(senderId, receiverId);
          if (!mutual) {
            return socket.emit("error", "⚠️ Both users must follow each other to chat.");
          }
        }

        // Mark messages from the other person as seen
        await markMessagesAsSeen(receiverId, senderId);

        // Load last 30 messages
        const { success, messages, error } = await getConversation(senderId, receiverId, 30);
        if (!success) {
          return socket.emit("error", error);
        }

        // Bot: send welcome message if no history yet
        if (isBot && messages.length === 0) {
          const welcomeText = "Hey! I'm your assistant 🤖. How can I help you today?";
          const saved = await saveMessage({
            senderId: BOT_USER_ID,
            receiverId: senderId,
            content: welcomeText,
          });

          if (!saved.success) {
            return socket.emit("error", "Failed to initiate bot chat.");
          }

          socket.emit("oldMessages", [saved.message]);
        } else {
          socket.emit("oldMessages", messages);
        }

        socket.emit("roomJoined", roomId);
      } catch (err) {
        console.error("joinRoom error:", err.message);
        socket.emit("error", "❌ Failed to join room. Please try again.");
      }
    });

    // ─── SEND MESSAGE ─────────────────────────────────────────────────────────
    // Called when a user sends a message.
    // 1. Saves user message to DB
    // 2. Broadcasts to room
    // 3. If bot room: gets AI reply, saves it, broadcasts it
    socket.on("sendMessage", async ({ roomId, senderId, receiverId, message }) => {
      try {
        if (!roomId || !senderId || !receiverId || !message) {
          return socket.emit("error", "Missing required fields.");
        }

        // Save and broadcast user's message
        const saved = await saveMessage({ senderId, receiverId, content: message });
        if (!saved.success) {
          return socket.emit("error", saved.error);
        }

        io.to(roomId).emit("receiveMessage", saved.message);

        // If talking to bot, generate and send AI reply
        const isBot = receiverId === BOT_USER_ID;
        if (isBot) {
          const botReplyObj = await getBotResponse(message);

          const botText = botReplyObj?.success
            ? botReplyObj.reply
            : " Sorry, I couldn't process that. Please try again.";

          const savedBotMsg = await saveMessage({
            senderId: BOT_USER_ID,
            receiverId: senderId,
            content: botText,
          });

          if (!savedBotMsg.success) {
            return socket.emit("error", "Bot reply could not be saved.");
          }

          io.to(roomId).emit("receiveMessage", savedBotMsg.message);
        }
      } catch (err) {
        console.error("sendMessage error:", err.message);
        socket.emit("error", " Failed to send message. Try again.");
      }
    });

    // ─── LOAD MORE MESSAGES (scroll up / pagination) ──────────────────────────
    // Called when the user scrolls up in a chat window to load older messages.
    // Client sends the timestamp of the oldest message currently visible.
    socket.on("loadMore", async ({ userId1, userId2, before }) => {
      try {
        if (!before) {
          return socket.emit("error", "Cursor (before) is required for loadMore.");
        }

        const { success, messages, hasMore, error } = await getConversation(
          userId1,
          userId2,
          30,
          before
        );

        if (!success) {
          return socket.emit("error", error);
        }

        // Sent only to the requesting socket, not the whole room
        socket.emit("olderMessages", { messages, hasMore });
      } catch (err) {
        console.error("loadMore error:", err.message);
        socket.emit("error", " Failed to load older messages.");
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};