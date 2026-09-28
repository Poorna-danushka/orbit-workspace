const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { body, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const avatarStorage = multer.memoryStorage();

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max for avatars
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(Object.assign(new Error('Only image files are allowed for avatars.'), { status: 400 }));
    }
    cb(null, true);
  },
});
const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many avatar uploads. Please try again later.' },
});

router.use(verifyToken);

router.get('/search', validate([
  query('q').optional().isString().trim().isLength({ max: 100 }),
]), userController.searchUsers);
router.get('/me', userController.getMe);
router.patch('/profile', validate([
  body('username').isString().trim().isLength({ min: 2, max: 50 }),
]), userController.updateProfile);
router.patch('/change-password', validate([
  body('currentPassword').isByteLength({ min: 1, max: 72 }),
  body('newPassword').isByteLength({ min: 8, max: 72 }),
]), userController.changePassword);

// Avatar upload — field name must be "avatar"
router.post('/avatar', avatarUploadLimiter, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, userController.uploadAvatar);

module.exports = router;
