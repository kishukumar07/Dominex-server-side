import path from "path";
import crypto from "crypto";
import multer from "multer"; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || "./public/temp"),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
  cb(null, allowed.includes(file.mimetype));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB


export default upload ; 