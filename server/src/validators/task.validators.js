const { body, query } = require('express-validator');

const taskFields = (optional = false) => [
  body('title')
    .if((value, { req }) => !optional || value !== undefined)
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('status').optional().isIn(['Todo', 'In Progress', 'Review', 'Completed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('assignedTo').optional({ nullable: true, checkFalsy: true }).isMongoId(),
];

const listTasksValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const createTaskValidation = [body('projectId').isMongoId(), ...taskFields()];
const updateTaskValidation = taskFields(true);
const updateTaskStatusValidation = [
  body('status').isIn(['Todo', 'In Progress', 'Review', 'Completed']),
];

module.exports = {
  createTaskValidation,
  listTasksValidation,
  updateTaskStatusValidation,
  updateTaskValidation,
};
