const { body, query } = require('express-validator');

const searchUsersValidation = [
  query('q').optional().isString().trim().isLength({ max: 100 }),
];

const updateProfileValidation = [
  body('username').isString().trim().isLength({ min: 2, max: 50 }),
];

const changePasswordValidation = [
  body('currentPassword').isByteLength({ min: 1, max: 72 }),
  body('newPassword').isByteLength({ min: 8, max: 72 }),
];

module.exports = {
  changePasswordValidation,
  searchUsersValidation,
  updateProfileValidation,
};
