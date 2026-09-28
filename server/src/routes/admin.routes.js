const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { verifyAdmin } = require('../middlewares/admin.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');

router.use(verifyAdmin);
router.param('id', validateMongoIdParam('resource id'));

router.patch('/users/:id/role', body('role').isIn(['admin', 'user']), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}, adminController.updateUserRole);
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getActivity);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/projects', adminController.getAllProjects);
router.delete('/projects/:id', adminController.deleteProject);
router.post('/broadcast', body('message').isString().trim().isLength({ min: 1, max: 2000 }), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}, adminController.broadcastNotification);

module.exports = router;
