const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a house room — all house events are scoped to a room
    socket.on("join_house", (houseId) => {
      socket.join(`house_${houseId}`);
      console.log(`[Socket] ${socket.id} joined house_${houseId}`);
    });

    socket.on("leave_house", (houseId) => {
      socket.leave(`house_${houseId}`);
    });

    // Private 1-on-1 chatting for pre-match communication
    socket.on("join_chat", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket] ${socket.id} joined personal room user_${userId}`);
    });

    socket.on("send_message", async (data) => {
      // data: { sender: userId, receiver: userId, content: string }
      const Message = require("../models/Message");
      try {
        const newMessage = await Message.create(data);
        // Emit to the receiver's personal room
        io.to(`user_${data.receiver}`).emit("receive_message", newMessage);
        // Also emit back to the sender so their UI updates
        io.to(`user_${data.sender}`).emit("receive_message", newMessage);
      } catch (error) {
        console.error("[Socket] Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit to all members of a house room
const emitToHouse = (houseId, event, data) => {
  if (io) io.to(`house_${houseId}`).emit(event, data);
};

module.exports = initSocket;
module.exports.emitToHouse = emitToHouse;
