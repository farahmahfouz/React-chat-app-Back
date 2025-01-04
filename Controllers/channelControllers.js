const Channel = require("../Models/channelModel.js");
const User = require("../Models/userModel.js");
const mongoose = require("mongoose");

exports.createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.user._id;
    const admin = await User.findById(userId);
    if (!admin) throw new Error("Admin not found", 404);

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length)
      throw new Error("Invalid members", 400);

    const channel = await Channel.create({
      name,
      members,
      admin: userId,
    });

    await channel.save();

    res.status(200).send({
      status: "success",
      message: "Channel created successfully",
      data: { channel },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getAllChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const channels = await Channel.find({
      $or: [{ members: userId }, { admin: userId }],
    }).sort({ updatedAt: -1 });
    res.status(200).send({
      status: "success",
      message: "Channels retrieved successfully",
      data: { channels },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });
    const messages = channel.messages;
    if (!channel) throw new Error("Channel not found", 404);
    res.status(200).send({
      status: "success",
      message: "Channel messages retrieved successfully",
      data: { messages },
    });
  } catch (err) {
    console.error(err);
  }
};
