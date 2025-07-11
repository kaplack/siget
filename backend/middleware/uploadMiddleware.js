// middleware/uploadMiddleware.js
const multer = require("multer");

// Use memory storage for quick buffer access (no file saved to disk)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = { upload };
