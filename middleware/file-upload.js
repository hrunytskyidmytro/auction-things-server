const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MINE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MINE_TYPE_MAP[file.mimetype];
      cb(null, uuidv1() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValidMimeType = !!MINE_TYPE_MAP[file.mimetype];
    if (!isValidMimeType) {
      const error = new Error("Неправильний тип mime!");
      return cb(error, false);
    }
    cb(null, true);
  },
});

module.exports = fileUpload;
