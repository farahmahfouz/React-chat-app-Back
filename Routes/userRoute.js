const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getUserData,
  updateProfile,
  addProfileImage,
  deleteImage,
  logout,
} = require("../Controllers/userController.js");
const { auth } = require("../Middlewares/authMiddlewares.js");
const { uploadImages, handleImages } = require("../Middlewares/image.js");

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-info", auth, getUserData);
router.post("/update-profile", auth, updateProfile);
router.post(
  "/add-profile-image",
  auth,
  uploadImages([{ name: "profile-image", count: 1 }]),
  handleImages("profile-image"),
  addProfileImage
);
router.delete("/remove-profile-image", auth, deleteImage);
router.post("/logout", auth, logout);


module.exports = router;
