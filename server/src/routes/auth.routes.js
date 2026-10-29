const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const googleOAuthController = require('../controllers/google-oauth.controller');
const { validate } = require('../utils/validation.util');
const { createRateLimiter } = require('../utils/rate-limit.util');
const {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
} = require('../validators/auth.validators');

const sensitiveActionLimiter = (max, message) => createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max,
  message,
});

const loginLimiter = sensitiveActionLimiter(10, 'Too many sign-in attempts. Please try again later.');
const registrationLimiter = sensitiveActionLimiter(10, 'Too many registration attempts. Please try again later.');
const resetRequestLimiter = sensitiveActionLimiter(5, 'Too many password-reset requests. Please try again later.');
const googleOAuthLimiter = sensitiveActionLimiter(20, 'Too many Google sign-in attempts. Please try again later.');

router.post('/register', validate(registerValidation), registrationLimiter, authController.register);

router.post('/login', validate(loginValidation), loginLimiter, authController.login);
router.get('/google', googleOAuthLimiter, googleOAuthController.startGoogleOAuth);
router.get('/google/callback', googleOAuthLimiter, googleOAuthController.googleCallback);
router.post('/refresh', authController.refresh);

router.post('/forgot-password', validate(forgotPasswordValidation), resetRequestLimiter, authController.forgotPassword);

router.post('/reset-password', validate(resetPasswordValidation), resetRequestLimiter, authController.resetPassword);

router.post('/logout', authController.logout);

module.exports = router;
