const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { createRateLimiter } = require('../utils/rate-limit.util');
const { validate } = require('../utils/validation.util');
const {
  changePasswordValidation,
  searchUsersValidation,
  updateProfileValidation,
} = require('../validators/user.validators');

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
const avatarUploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many avatar uploads. Please try again later.',
});

router.use(verifyToken);

router.get('/search', validate(searchUsersValidation), userController.searchUsers);
router.get('/me', userController.getMe);
router.patch('/profile', validate(updateProfileValidation), userController.updateProfile);
router.patch('/change-password', validate(changePasswordValidation), userController.changePassword);

// Avatar upload — field name must be "avatar"
router.post('/avatar', avatarUploadLimiter, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, userController.uploadAvatar);

module.exports = router;
