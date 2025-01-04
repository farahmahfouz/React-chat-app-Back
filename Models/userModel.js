const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    password: { type: String, required: [true, "Password is required"] },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    image: { type: String, required: false },
    color: { type: Number, required: false },
    profileSetup: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
