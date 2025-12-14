import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "upload-" + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Basic image filter
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
  }
});

// Upload endpoint
router.post("/", authenticate, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded or invalid file type" });
  }

  // Return the URL to access the file
  // We will configure express to serve /uploads static files
  
  // Use protocol and host from request to build full URL if needed, 
  // but relative path /uploads/filename is usually enough for frontend.
  // However, often better to return absolute URL or root-relative.
  // Let's return root-relative.
  
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({ 
    message: "File uploaded successfully",
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

export default router;
