const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/invitations/:token', projectController.getInvitation);
router.use(verifyToken);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id/invitations', projectController.listInvitations);
router.post('/:id/invite', projectController.inviteMember);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Members management
router.post('/:id/members', projectController.addMember);
router.get('/:id/members', projectController.listMembers);
router.delete('/:id/members/:memberId', projectController.removeMember);
router.post('/invitations/:token/accept', projectController.acceptInvitation);
router.post('/invitations/:token/reject', projectController.rejectInvitation);

module.exports = router;
