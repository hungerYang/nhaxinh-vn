const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: verify user JWT
function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'user' && decoded.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const AVATARS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = crypto.randomBytes(3).toString('hex');
    cb(null, `img_${timestamp}_${randomStr}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp). Tối đa 5MB.'));
    }
    cb(null, true);
  }
});

// POST /api/upload/avatar - Upload avatar image (max 2MB)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = crypto.randomBytes(3).toString('hex');
    cb(null, `avatar_${timestamp}_${randomStr}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp). Tối đa 2MB.'));
    }
    cb(null, true);
  }
});

router.post('/upload/avatar', requireUser, avatarUpload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Không có file nào được tải lên.' });
  }

  const url = '/uploads/avatars/' + req.file.filename;
  return res.json({ success: true, url });
});

// POST /api/upload
router.post('/upload', requireUser, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Không có file nào được tải lên.' });
  }

  const url = '/uploads/' + req.file.filename;
  return res.json({ success: true, url });
});

// Error handler for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File quá lớn. Tối đa 5MB.' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

module.exports = router;
