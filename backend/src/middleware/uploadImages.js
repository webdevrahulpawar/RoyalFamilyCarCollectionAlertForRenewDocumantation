const multer = require("multer");

// Use memory storage so we can upload to Cloudinary (or fallback local) without writing temp files.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: 4,
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
});

const uploadImages = upload.array("images", 4);

module.exports = { uploadImages };

