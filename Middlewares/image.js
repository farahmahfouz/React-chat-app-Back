const AppError = require("../utils/App.Error");
const multer = require("multer");
const ImageKit = require("imagekit");

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

// Multer storage configuration to keep files in memory
const multerStorage = multer.memoryStorage(); // Store files in memory, not on disk

// Filter to only allow image files
const multerFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, please upload only images.", 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilterImage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
});

// Middleware to handle and upload images to ImageKit
exports.handleImages = (fieldname) => {
  return async (req, res, next) => {
    const files = req.files?.[fieldname];
    console.log({ files, fieldname }); // Debugging statement

    if (!files) return next();

    try {
      // Upload images to ImageKit
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const result = await imagekit.upload({
            file: file.buffer, // file buffer from multer
            fileName: `api-${Date.now()}.jpeg`, // unique filename
            folder: "/uploads", // optional: specify folder in ImageKit
          });
          return result.url;
        })
      );

      // Store URLs of uploaded images in request body
      req.body[fieldname] = uploadedImages;
      next();
    } catch (error) {
      return next(new AppError("Error uploading images to ImageKit", 500));
    }
  };
};

// Middleware to upload images using Multer (with ImageKit storage)
exports.uploadImages = (fields) => {
  return upload.fields([
    ...fields.map((field) => ({ name: field.name, maxCount: field.count })),
  ]);
};
