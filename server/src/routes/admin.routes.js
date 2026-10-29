const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyAdmin } = require('../middlewares/admin.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');
const { validate } = require('../utils/validation.util');
const {
  broadcastValidation,
  updateUserRoleValidation,
} = require('../validators/admin.validators');

router.use(verifyAdmin);
router.param('id', validateMongoIdParam('resource id'));

router.patch('/users/:id/role', validate(updateUserRoleValidation), adminController.updateUserRole);
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/projects', adminController.getAllProjects);
router.delete('/projects/:id', adminController.deleteProject);
router.post('/broadcast', validate(broadcastValidation), adminController.broadcastNotification);

module.exports = router;
