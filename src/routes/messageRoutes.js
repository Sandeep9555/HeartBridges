const express = require("express");
const Message = require("../models/message");
const { userAuth } = require("../middleware/auth");

const messageRouter = express.Router();

// Send a message
messageRouter.post("/message/send", userAuth, async (req, res) => {
  const senderId = req.user._id;
  const { receiver: receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({
      message: "Receiver Id and message content are required",
    });
  }

  try {
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content,
      messageType: req.body.messageType || "text",
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Get messages between two users (conversation)
messageRouter.get("/message/conversation", userAuth, async (req, res) => {
  const { receiverId } = req.query; // Get receiverId from query parameters
  const senderId = req.user._id; // Get senderId from authenticated user

  // Ensure receiverId is provided
  if (!receiverId) {
    return res.status(400).json({
      message: "Receiver Id is required",
    });
  }

  try {
    // Fetch messages from the database
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .sort({ createdAt: 1 }) // Sort messages in ascending order by createdAt
      .populate("sender", "username") // Populate sender's username
      .populate("receiver", "username"); // Populate receiver's username

    // If no messages found
    if (!messages.length) {
      return res.status(404).json({
        message: "No messages found",
      });
    }

    // Return the messages
    res.status(200).json(messages);
  } catch (err) {
    // Log the error and respond with a 500 status
    console.error("Error fetching messages:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Mark message as read
messageRouter.post("/message/markAsRead", userAuth, async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to mark this message as read",
      });
    }

    message.read = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread messages for the logged-in user
// messageRouter.get("/message/unread", userAuth, async (req, res) => {
//   const userId = req.user._id;

//   try {
//     const unreadMessages = await Message.find({
//       receiver: userId,
//       read: false,
//     })
//       .populate("sender", "username")
//       .populate("receiver", "username");

//     res.status(200).json(unreadMessages);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = messageRouter;
