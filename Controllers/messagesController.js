const AppError = require("../utils/App.Error");
const Message = require("../Models/messageModel.js");
const { mkdirSync, renameSync } = require("fs");

exports.getMessages = async (req, res, next) => {
  try {
    const user1 = req.user._id + "";

    const user2 = req.body.id;

    if (!user1 || !user2) throw new AppError("Both user ID are required", 400);
    const message = await Message.find({
      $or: [
        { sender: user1, reciever: user2 },
        { sender: user2, reciever: user1 },
      ],
    }).sort({ timestamp: 1 });
    res.status(200).send({
      status: "success",
      message: "Message retrieved successfully",
      data: { message },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("File is required", 400);

    const date = Date.now();
    const fileDir = `upload/file/${date}`;
    const fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    res.status(201).send({
      filePath: fileName,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
