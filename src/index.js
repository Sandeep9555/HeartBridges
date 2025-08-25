const express = require("express");
const http = require("http");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./config/database");
const uploadRoute = require("./routes/uploadRoutes");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRoutes");
const requestRouter = require("./routes/requestRoutes");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes");

const initializeSocket = require("./socket");
const redisClient = require("./config/redisClient"); // ✅ Import Redis client

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 7777;

app.set("trust proxy", 1);
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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());
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

// ✅ Socket.IO setup with Redis (no in-memory onlineUsers)
initializeSocket(io);

// ✅ Start server
connectDB()
  .then(async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      console.log("✅ Redis connected");

      // ✅ Socket needs Redis, so init AFTER connecting
      initializeSocket(io);

      server.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("❌ Redis connection failed:", err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
