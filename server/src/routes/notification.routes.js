const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');

router.use(verifyToken);
router.param('id', validateMongoIdParam('notification id'));

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllRead);

module.exports = router;
