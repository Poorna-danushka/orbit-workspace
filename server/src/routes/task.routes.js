const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');
const { validate } = require('../utils/validation.util');
const {
  createTaskValidation,
  listTasksValidation,
  updateTaskStatusValidation,
  updateTaskValidation,
} = require('../validators/task.validators');

router.use(verifyToken);
router.param('id', validateMongoIdParam('task id'));
router.param('projectId', validateMongoIdParam('project id'));

router.get('/my', taskController.getMyTasks);
router.get('/all', validate(listTasksValidation), taskController.getAllUserTasks);
router.get('/project/:projectId', taskController.getTasksByProject);
router.post('/', validate(createTaskValidation), taskController.createTask);
router.put('/:id', validate(updateTaskValidation), taskController.updateTask);
router.patch('/:id/status', validate(updateTaskStatusValidation), taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
