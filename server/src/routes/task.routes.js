const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const taskController = require('../controllers/task.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

const taskFields = (optional = false) => [
  body('title').if((value, { req }) => !optional || value !== undefined)
    .isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body('status').optional().isIn(['Todo', 'In Progress', 'Review', 'Completed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('assignedTo').optional({ nullable: true, checkFalsy: true }).isMongoId(),
];

router.use(verifyToken);
router.param('id', validateMongoIdParam('task id'));
router.param('projectId', validateMongoIdParam('project id'));

router.get('/my', taskController.getMyTasks);
router.get('/all', validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
]), taskController.getAllUserTasks);
router.get('/project/:projectId', taskController.getTasksByProject);
router.post('/', validate([
  body('projectId').isMongoId(),
  ...taskFields(),
]), taskController.createTask);
router.put('/:id', validate(taskFields(true)), taskController.updateTask);
router.patch('/:id/status', validate([
  body('status').isIn(['Todo', 'In Progress', 'Review', 'Completed']),
]), taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
