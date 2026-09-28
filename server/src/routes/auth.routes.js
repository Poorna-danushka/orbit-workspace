const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middlewares/auth.middleware');

// Validation middleware generator
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({ errors: errors.array() });
  };
};

const sensitiveActionLimiter = (max, message) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message },
});

const loginLimiter = sensitiveActionLimiter(10, 'Too many sign-in attempts. Please try again later.');
const registrationLimiter = sensitiveActionLimiter(10, 'Too many registration attempts. Please try again later.');
const resetRequestLimiter = sensitiveActionLimiter(5, 'Too many password-reset requests. Please try again later.');
const googleOAuthLimiter = sensitiveActionLimiter(20, 'Too many Google sign-in attempts. Please try again later.');

router.post('/register', validate([
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3 to 50 characters'),
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
  body('password').isByteLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 bytes'),
]), registrationLimiter, authController.register);

router.post('/login', validate([
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
  body('password').isByteLength({ min: 1, max: 72 }).withMessage('Password is required and must be at most 72 bytes'),
]), loginLimiter, authController.login);
router.get('/google', googleOAuthLimiter, authController.startGoogleOAuth);
router.get('/google/callback', googleOAuthLimiter, authController.googleCallback);
router.post('/refresh', authController.refresh);

router.post('/forgot-password', validate([
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
]), resetRequestLimiter, authController.forgotPassword);

router.post('/reset-password', validate([
  body('token').isLength({ min: 32, max: 256 }).withMessage('Reset token is invalid'),
  body('newPassword').isByteLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 bytes'),
]), resetRequestLimiter, authController.resetPassword);

router.post('/logout', authController.logout);

module.exports = router;
