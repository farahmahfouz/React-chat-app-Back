const mongoose = require("mongoose");

const channelSchema = mongoose.Schema({
  name: { type: String, required: true },
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  admin: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: false },
  ],
  createdAt: { type: Date, default: Date.now() },
  updateAt: { type: Date, default: Date.now() },
});

channelSchema.pre("save", function (next) {
  this.updateAt = Date.now();
  next();
});

channelSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updateAt: Date.now() });
  next();
});

const Channel = mongoose.model("Channel", channelSchema);
module.exports = Channel;
