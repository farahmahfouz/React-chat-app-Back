const User = require("../Models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/App.Error.js");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  const token = jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
  return token;
};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const existingUser = await User.findOne({ email });
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    if (existingUser) {
      return res.status(400).send("Email is already exist!");
    }
    const user = await User.create({ email, password: hashedPassword });
    const token = createToken(email, user._id);
    res.cookie("jwt", token, {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).send({
      status: "success",
      message: "User created successfully",
      data: {
        user,
      },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found!", 400);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("email or password id invalid", 400);
    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return res.status(201).send({
      status: "success",
      message: "Login Successful",
      data: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("No user found with this ID", 404);
    res.status(200).send({
      status: "success",
      message: "User retrieved successfully",
      data: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName)
      throw new AppError("Firstname and lastname and color is Required");
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true },
      { runValidators: true }
    );
    if (!userData) throw new AppError("No user Found By This ID", 404);
    res.status(200).send({
      status: "success",
      message: "Data updated successfuly",
      data: {
        id: userData._id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

exports.addProfileImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const imagePath = req.body["profile-image"]
      ? req.body["profile-image"][0]
      : null;

    if (!imagePath) throw new AppError("No image file provided", 400);

    const userData = await User.findByIdAndUpdate(
      userId,
      { image: imagePath },
      { new: true, runValidators: true }
    );

    if (!userData) throw new AppError("No user found with this ID", 404);

    res.status(200).send({
      status: "success",
      message: "Profile image updated successfully",
      data: {
        id: userData._id,
        image: userData.image,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const userId = req.user._id; // Ensure you are getting the user ID correctly

    // Update the user document to remove the image field
    const userData = await User.findByIdAndUpdate(
      userId,
      { $unset: { image: 1 } }, // Remove the image field
      { new: true, runValidators: true }
    );

    if (!userData) throw new AppError("No user found with this ID", 404);

    res.status(200).send({
      status: "success",
      message: "Profile image deleted successfully",
      data: {
        id: userData._id,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    res.status(200).send({
      status: "success",
      message: "Logout successfuly",
    });
  } catch (err) {
    next(err);
  }
};
