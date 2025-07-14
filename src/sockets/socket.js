// socket.js (Backend)
import { Server } from "socket.io";
import { isMutualFollow } from "../controllers/followController.js";
import { getMessages, sendMessage } from "../controllers/msgController2.js";
import getBotResponse from "../chatBot/botLogic_OpenAi.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }, // Allow all origins (adjust in production)
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("joinRoom", async ({ senderId, receiverId }) => {
      try {
        const isBot = receiverId === "6874acd20ae3bd003068b38d";
        const roomId = [senderId, receiverId].sort().join("_");
        socket.join(roomId);

        const { messages } = await getMessages(senderId, receiverId);

        if (isBot) {
          console.log("Bot chat initiated.");

          if (messages.length === 0) {
            const welcomeText =
              "Hey there! I'm your chat assistant 🤖. Ask me anything!\nHow may I assist you today?";
            const savedWelcome = await sendMessage({
              senderId: receiverId, // bot
              receiverId: senderId, // user
              message: welcomeText,
            });

            io.to(roomId).emit("receiveMessage", savedWelcome.message);
          } else {
            socket.emit("oldMessages", messages);
          }
        } else {
          const mutual = await isMutualFollow(senderId, receiverId);
          if (!mutual) {
            return socket.emit(
              "error",
              "⚠️ Both users must follow each other to start a chat."
            );
          }
          socket.emit("oldMessages", messages);
        }

        socket.emit("roomJoined", roomId);
      } catch (err) {
        console.error("joinRoom error:", err.message);
        socket.emit("error", "❌ Failed to join room. Please try again.");
      }
    });

    socket.on(
      "sendMessage",
      async ({ roomId, senderId, receiverId, message }) => {
        try {
          const savedMessage = await sendMessage({
            senderId,
            receiverId,
            message,
          });

          io.to(roomId).emit("receiveMessage", savedMessage.message);

          const isBot = receiverId === "6874acd20ae3bd003068b38d";

          if (isBot) {
            const botReplyObj = await getBotResponse(message);

            const botMessageText = botReplyObj?.success
              ? botReplyObj.reply
              : "⚠️ Oops! Something went wrong. Please try again.";

            const savedBotMessage = await sendMessage({
              senderId: receiverId, // bot
              receiverId: senderId, // user
              message: botMessageText,
            });
            // console.log(savedBotMessage);

            io.to(roomId).emit("receiveMessage", savedBotMessage.message);
          }
        } catch (err) {
          console.error("sendMessage error:", err.message);
          socket.emit("error", "❌ Failed to send message. Try again.");
        }
      }
    );
  });
};
