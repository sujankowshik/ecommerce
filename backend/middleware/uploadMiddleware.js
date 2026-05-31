import multer from 'multer';

// Use memory storage to store raw files in buffers before uploading to Cloudinary
const storage = multer.memoryStorage();

// File type validation helper
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid format: Only image files are permitted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

export default upload;
