const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Allow any string content
      required: true,
      trim: true, // Ensure content is provided
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "video"], // Indicate the type of the message
      default: "text",
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

//messageSchema.index({ sender: 1, receiver: 1, content: 1 }, { unique: true });
module.exports = mongoose.model("Message", messageSchema);
