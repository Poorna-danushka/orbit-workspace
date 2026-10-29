const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');
const { validate } = require('../utils/validation.util');
const projectInvitationController = require('../controllers/project-invitation.controller');
const projectInvitationQueryController = require('../controllers/project-invitation-query.controller');
const projectMembersController = require('../controllers/project-members.controller');
const {
  createProjectValidation,
  inviteProjectMemberValidation,
  listProjectsValidation,
  updateProjectValidation,
} = require('../validators/project.validators');

router.get('/invitations/:token', projectInvitationQueryController.getInvitation);
router.use(verifyToken);
router.param('id', validateMongoIdParam('project id'));
router.param('memberId', validateMongoIdParam('member id'));

router.post('/', validate(createProjectValidation), projectController.createProject);
router.get('/', validate(listProjectsValidation), projectController.getProjects);
router.get('/:id/invitations', projectInvitationQueryController.listInvitations);
router.post('/:id/invite', validate(inviteProjectMemberValidation), projectInvitationController.inviteMember);
router.get('/:id', projectController.getProjectById);
router.put('/:id', validate(updateProjectValidation), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Members management
router.post('/:id/members', projectMembersController.addMember);
router.get('/:id/members', projectMembersController.listMembers);
router.delete('/:id/members/:memberId', projectMembersController.removeMember);
router.post('/invitations/:token/accept', projectInvitationController.acceptInvitation);
router.post('/invitations/:token/reject', projectInvitationController.rejectInvitation);

module.exports = router;
