import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  videos: ["video/mp4", "video/mpeg", "video/avi"],
  audios: ["audio/mpeg", "audio/wav", "audio/ogg"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (req.user?._id) basePath += `/${req.user._id}`;
      const fullPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      cb(null, path.resolve(fullPath));
    },
    filename: (req, file, cb) => {
      const uniqueFileName =
        Date.now() + "__" + Math.random() + "__" + file.originalname;
      file.finalPath = `${basePath}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(new Error("Invalid file type"), false);
    }
  };

  return multer({
    fileFilter,
    storage,
  });
};

// https://mimetype.io/all-types
