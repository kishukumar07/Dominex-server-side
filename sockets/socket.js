// socket.js (Backend)
import { Server } from "socket.io";
import { isMutualFollow } from "../src/controllers/followController.js";
import {
  getMessages,
  sendMessage,
} from "../src/controllers/msgController2.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }, // Allow all origins (adjust in production)
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("joinRoom", async ({ senderId, receiverId }) => {
      if (await isMutualFollow(senderId, receiverId)) {
        const roomId = [senderId, receiverId].sort().join("_");

        socket.join(roomId);
        // Send old messages
        const messages = await getMessages(senderId, receiverId);
        socket.emit("oldMessages", messages);
        socket.emit("roomJoined", roomId);
      } else {
        socket.emit("error", "Both users must follow each other to chat.");
      }
    });
    socket.on(
      "sendMessage",
      async ({ roomId, senderId, receiverId, message }) => {
        const savedMessage = await sendMessage({
          senderId,
          receiverId,
          message,
        });
        io.to(roomId).emit("receiveMessage", savedMessage);
      }
    );
  });
};
