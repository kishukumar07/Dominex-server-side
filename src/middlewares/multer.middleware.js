import multer from "multer";

// Configure storage (this saves files to 'uploads/' folder with original filename)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR || "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Create the multer instance
const upload = multer({ storage });

export default upload;
