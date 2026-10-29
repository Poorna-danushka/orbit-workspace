const { body } = require('express-validator');

const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3 to 50 characters'),
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
  body('password').isByteLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 bytes'),
];

const loginValidation = [
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
  body('password').isByteLength({ min: 1, max: 72 }).withMessage('Password is required and must be at most 72 bytes'),
];

const forgotPasswordValidation = [
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').isLength({ min: 32, max: 256 }).withMessage('Reset token is invalid'),
  body('newPassword').isByteLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 bytes'),
];

module.exports = {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
};
