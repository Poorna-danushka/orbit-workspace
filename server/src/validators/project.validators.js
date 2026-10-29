const { body, query } = require('express-validator');

const createProjectValidation = [
  body('title').isString().trim().isLength({ min: 1, max: 120 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 3000 }),
];

const listProjectsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const inviteProjectMemberValidation = [
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail(),
];

const updateProjectValidation = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 3000 }),
  body('status').optional().isIn(['active', 'completed', 'archived']),
];

module.exports = {
  createProjectValidation,
  inviteProjectMemberValidation,
  listProjectsValidation,
  updateProjectValidation,
};
