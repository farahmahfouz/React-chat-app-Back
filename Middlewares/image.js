const AppError = require("../utils/App.Error");
const multer = require("multer");
const ImageKit = require("imagekit");
const sharp = require("sharp");

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
    fileSize: 2 * 1024 * 1024, // 2 MB limit
  },
});

// Middleware to handle and upload images to ImageKit
exports.handleImages = (fieldname) => {
  return async (req, res, next) => {
    const files = req.files?.[fieldname];
    console.log({ files, fieldname }); // Debugging statement

    if (!files) return next();

    try {
      // Upload images to ImageKit with compression if needed
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          let processedBuffer = file.buffer;

          // Check if file size is greater than 2MB
          if (file.size > 2 * 1024 * 1024) {
            processedBuffer = await sharp(file.buffer)
              .resize(1000, 1000, {
                // Reduced dimensions for smaller file size
                fit: "inside",
                withoutEnlargement: true,
              })
              .jpeg({ quality: 70 }) // Reduced quality for smaller file size
              .toBuffer();
          }

          const result = await imagekit.upload({
            file: processedBuffer,
            fileName: `api-${Date.now()}.jpeg`,
            folder: "/uploads",
          });
          return result.url;
        })
      );

      // Store URLs of uploaded images in request body
      req.body[fieldname] = uploadedImages;
      next();
    } catch (error) {
      return next(new AppError("Error processing or uploading images", 500));
    }
  };
};

// Middleware to upload images using Multer (with ImageKit storage)
exports.uploadImages = (fields) => {
  return upload.fields([
    ...fields.map((field) => ({ name: field.name, maxCount: field.count })),
  ]);
};
