const jwt = require("jsonwebtoken");
const User = require("../Models/userModel.js");
const AppError = require("../utils/App.Error.js");

exports.auth = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt || req.headers.authorization;
    if (!token) {
      return next(new AppError("Authorization header is required", 401));
    }
    // console.log("Request Headers:", req.headers);
    // console.log("Request Cookies:", req.cookies);

    if (req.headers.authorization) {
      if (!token.startsWith("Bearer ")) {
        return next(new AppError("Invalid token format", 400));
      }
      token = token.split(" ")[1];
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Token Payload:", payload);


    const user = await User.findById(payload.userId);
    // console.log(`user`, user);
    if (!user) {
      return next(new AppError("No user found with this ID", 404));
    }
  
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(err);
  }
};
