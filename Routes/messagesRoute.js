const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "upload/file" });

const {
  getMessages,
  uploadFile,
} = require("../Controllers/messagesController.js");
const { auth } = require("../Middlewares/authMiddlewares.js");

router.post("/get-messages", auth, getMessages);
router.post("/upload-file", auth, upload.single("file"), uploadFile);

module.exports = router;
