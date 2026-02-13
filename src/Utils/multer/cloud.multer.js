import multer from "multer";

export const uploadToCloud = ({ validation = [] }) => {
  const storage = multer.diskStorage({});

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
