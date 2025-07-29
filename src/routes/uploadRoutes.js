// src/server/routes/upload.js
const express = require("express");
const { upload } = require("../utils/cloudinary"); // ✅ multer + cloudinary setup
const { userAuth } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/upload/image",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = req.file?.path || req.file?.secure_url;

      if (!imageUrl) {
        throw new Error("Image URL not found in uploaded file");
      }

      return res.status(200).json({ url: imageUrl });
    } catch (err) {
      console.error("❌ Cloudinary Upload Error:", err.message);
      return res
        .status(500)
        .json({ message: "Image upload failed", error: err.message });
    }
  }
);

module.exports = router;
