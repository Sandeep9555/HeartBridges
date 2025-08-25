// socket.js
const Message = require("./models/message");
const redisClient = require("./config/redisClient");

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    // Handle user going online
    socket.on("userOnline", async (userId) => {
      if (!userId) return;

      // ✅ Store user online in Redis (always as JSON string)
      await redisClient.set(userId, JSON.stringify(socket.id));

      io.emit("userOnlineStatus", { userId, isOnline: true });
      socket.join(userId);

      // Send undelivered messages
      try {
        const undeliveredMessages = await Message.find({
          receiver: userId,
          delivered: false,
        });

        for (const msg of undeliveredMessages) {
          io.to(userId).emit("receive_message", msg);
        }

        await Message.updateMany(
          { receiver: userId, delivered: false },
          { $set: { delivered: true } }
        );
      } catch (err) {
        console.error("❌ Failed to send undelivered messages:", err);
      }

      // Notify recent senders
      try {
        const recentSenders = await Message.find({ receiver: userId }).distinct(
          "sender"
        );

        for (const senderId of recentSenders) {
          const senderSocketRaw = await redisClient.get(senderId);
          const senderSocket = senderSocketRaw
            ? JSON.parse(senderSocketRaw)
            : null;

          if (senderSocket && senderId !== userId) {
            io.to(senderSocket).emit("user_now_online_notification", {
              userId,
            });
          }
        }
      } catch (err) {
        console.log("X Failed to notify recent senders:", err);
      }
    });

    // Real-time message send
    socket.on("send_message", async (message) => {
      const { _id, sender, receiver, content, messageType, createdAt } =
        message;
      if (!sender || !receiver) return;

      const receiverSocketRaw = await redisClient.get(receiver);
      const receiverSocket = receiverSocketRaw
        ? JSON.parse(receiverSocketRaw)
        : null;

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", {
          _id,
          sender,
          receiver,
          content,
          messageType,
          createdAt,
          read: true,
          delivered: true,
          connectionId: sender,
        });

        try {
          await Message.findByIdAndUpdate(_id, { $set: { delivered: true } });
        } catch (err) {
          console.error("x Failed to update delivered status:", err);
        }
      }

      const senderSocketRaw = await redisClient.get(sender);
      const senderSocket = senderSocketRaw ? JSON.parse(senderSocketRaw) : null;

      if (senderSocket && receiverSocket) {
        io.to(senderSocket).emit("message_delivered", {
          messageId: _id,
          receiverId: receiver,
        });
      }
    });

    // Typing indicator
    socket.on("typing", async ({ senderId, receiverId, isTyping }) => {
      const receiverSocketRaw = await redisClient.get(receiverId);
      const receiverSocket = receiverSocketRaw
        ? JSON.parse(receiverSocketRaw)
        : null;

      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", { senderId, isTyping });
      }
    });

    // Get currently online users
    socket.on("getOnlineUsers", async () => {
      const keys = await redisClient.keys("*"); // all user IDs
      socket.emit("userOnlineStatus", keys);
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      const keys = await redisClient.keys("*");
      for (const key of keys) {
        const valueRaw = await redisClient.get(key);
        const value = valueRaw ? JSON.parse(valueRaw) : null;

        if (value === socket.id) {
          await redisClient.del(key); // remove user from Redis
          io.emit("userOnlineStatus", { userId: key, isOnline: false });
          break;
        }
      }
    });
  });
};

module.exports = initializeSocket;
