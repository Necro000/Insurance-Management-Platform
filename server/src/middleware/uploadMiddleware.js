const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists (EC-ENV04)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Disk Storage Configuration ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // EC-D05: Sanitize filename — never use raw originalname as the path
    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_') // replace special chars
      .substring(0, 100);               // EC-D06: cap filename length

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${sanitized}`);
  },
});

// ─── File Type Filter ────────────────────────────────────────────────────────
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const fileFilter = (req, file, cb) => {
  // EC-D02: Reject disallowed MIME types
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      Object.assign(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), {
        statusCode: 400,
      }),
      false
    );
  }
  cb(null, true);
};

// ─── Multer Instance ─────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // EC-D01: 5MB max
  },
});

/**
 * Multer error handler — converts multer errors to standard API responses.
 * Use after upload middleware in routes.
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum allowed size is 5MB.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { upload, handleUploadError };
