const Message = require("../Models/messageModel.js");
const User = require("../Models/userModel.js");
const AppError = require("../utils/App.Error");
const mongoose = require("mongoose");

exports.searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    if (!searchTerm) throw new AppError("SearchTerm is required", 400);
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });
    res.status(200).send({
      status: "success",
      message: "Contacts retrieved successfully",
      data: { contacts },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    let userId = req.user._id + "";
    userId = new mongoose.Types.ObjectId(userId);
    const contact = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { reciever: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$reciever",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).send({
      status: "success",
      message: "Contacts retrieved successfully",
      data: { contact },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getAllContact = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      "firstName lastName _id"
    );

    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id.toString()
    }));
    
    res.status(200).send({
      status: "success",
      message: "Contacts retrieved successfully",
      data: { contacts },
    });
  } catch (err) {
    console.error(err);
  }
};
