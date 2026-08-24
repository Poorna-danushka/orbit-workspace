const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getProjectMessages } = require('../controllers/chat.controller');

router.use(verifyToken);
router.get('/project/:projectId/messages', getProjectMessages);

module.exports = router;
