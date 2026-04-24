const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: function (_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = { upload };

