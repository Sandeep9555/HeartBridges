const express = require("express");
const http = require("http");
const path = require("path");
const connectDB = require("./config/database");
const uploadRoute = require("./routes/uploadRoutes");
const app = express();
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRoutes");
const requestRouter = require("./routes/requestRoutes");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes");

const Message = require("./models/message");

const server = http.createServer(app);
const PORT = process.env.PORT || 7777;

const onlineUsers = {}; // userId -> socket.id

app.use(express.json());
app.use(cookieParser());

console.log(process.env.BASE_URL);
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

// ✅ API routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", messageRouter);
app.use("/", uploadRoute);

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "../client/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/dist/index.html"));
// });

// ✅ Socket.IO setup
io.on("connection", (socket) => {
  // ✅ Handle user going online
  socket.on("userOnline", async (userId) => {
    if (!userId) return;
    onlineUsers[userId] = socket.id;
    io.emit("userOnlineStatus", { userId, isOnline: true });
    socket.join(userId);

    // ✅ Send undelivered messages (one-time delivery)
    try {
      const undeliveredMessages = await Message.find({
        receiver: userId,
        delivered: false,
      });

      if (undeliveredMessages.length > 0) {
        for (const msg of undeliveredMessages) {
          io.to(userId).emit("receive_message", msg);
        }

        await Message.updateMany(
          { receiver: userId, delivered: false },
          { $set: { delivered: true } }
        );
      }
    } catch (err) {
      console.error("❌ Failed to send undelivered messages:", err);
    }

    try {
      const recentSenders = await Message.find({
        receiver: userId,
      }).distinct("sender");

      recentSenders.forEach((senderId) => {
        const senderSocket = onlineUsers[senderId];
        if (senderSocket && senderId != userId) {
          io.to(senderSocket).emit("user_now_online_notification", {
            userId,
          });
        }
      });
    } catch (err) {
      console.log("X Failed to notify recent senders:", err);
    }
  });

  // ✅ Real-time message send
  socket.on("send_message", async (message) => {
    const {
      _id,
      sender,
      receiver,
      content,
      messageType,
      createdAt,
      read,
      delivered,
    } = message;

    if (!sender || !receiver) return;

    // 🚫 Don't emit to sender again (already handled client-side)
    if (onlineUsers[receiver]) {
      io.to(onlineUsers[receiver]).emit("receive_message", {
        _id,
        sender,
        receiver,
        content,
        messageType,
        createdAt,
        read: true,
        delivered: true,
        connectionId: sender, // 👉 Pass sender as connectionId for receiver
      });

      try {
        await Message.findByIdAndUpdate(_id, {
          $set: {
            delivered: true,
          },
        });
      } catch (err) {
        console.error("x Failed to update delivered status:", err);
      }
    }
    if (onlineUsers[receiver] && onlineUsers[sender]) {
      io.to(onlineUsers[sender]).emit("message_delivered", {
        messageId: _id,
        receiverId: receiver,
      });
    }
  });

  // ✅ Typing indicator
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit("typing", {
        senderId,
        isTyping,
      });
    }
  });
  //getCurrently online users
  socket.on("getOnlineUsers", () => {
    socket.emit("userOnlineStatus", Object.keys(onlineUsers));
  });
  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    if (disconnectedUser) {
      delete onlineUsers[disconnectedUser];
      io.emit("userOnlineStatus", {
        userId: disconnectedUser,
        isOnline: false,
      });
    }
  });
});

// ✅ Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
