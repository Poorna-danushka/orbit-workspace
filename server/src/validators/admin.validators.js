const { body } = require('express-validator');

const updateUserRoleValidation = [body('role').isIn(['admin', 'user'])];
const broadcastValidation = [
  body('message').isString().trim().isLength({ min: 1, max: 2000 }),
];

module.exports = { broadcastValidation, updateUserRoleValidation };
