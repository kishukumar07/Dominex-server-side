// socket.js (Backend)
import { Server } from "socket.io";
import { isMutualFollow } from "../controllers/followController.js";
import { getMessages, sendMessage } from "../controllers/msgController2.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }, // Allow all origins (adjust in production)
  });

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("joinRoom", async ({ senderId, receiverId }) => {
      // console.log("joined");
      if (receiverId == "6874acd20ae3bd003068b38d") {
        //if reciever is bot ...
        // console.log('this is bot chatting')
        const roomId = [senderId, receiverId].sort().join("_");
        socket.join(roomId);
        const messages = getMessages(senderId, receiverId);

        if (messages.length === 0) {
          const welcomeText =
            "Hey there! I'm your chat assistant 🤖. Ask me anything!\nHow may I assist you today?";
          const savedWelcome = await sendMessage({
            senderId: receiverId, // bot
            receiverId: senderId, // user
            message: welcomeText,
          });

          io.to(roomId).emit("receiveMessage", savedWelcome);
        } else {
          socket.emit("oldMessages", messages);
        }
        socket.emit("roomJoined", roomId);
      } else if (await isMutualFollow(senderId, receiverId)) {
        const roomId = [senderId, receiverId].sort().join("_");

        socket.join(roomId);
        // Send old messages
        const messages = getMessages(senderId, receiverId);
        socket.emit("oldMessages", messages);
        socket.emit("roomJoined", roomId);
      } else {
        socket.emit("error", "Both users must follow each other to chat."); //need to update msg
      }
    });

    socket.on(
      "sendMessage",
      async ({ roomId, senderId, receiverId, message }) => {
        if (receiverId == "6874acd20ae3bd003068b38d") {
          //if recever is bot ..
        } else {
          //recever is another user ...
          const savedMessage = await sendMessage({
            senderId,
            receiverId,
            message,
          });
          io.to(roomId).emit("receiveMessage", savedMessage);
        }
      }
    );
  });
};
