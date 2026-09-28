const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array() });
};

router.get('/invitations/:token', projectController.getInvitation);
router.use(verifyToken);
router.param('id', validateMongoIdParam('project id'));
router.param('memberId', validateMongoIdParam('member id'));

router.post('/', validate([
  body('title').isString().trim().isLength({ min: 1, max: 120 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 3000 }),
]), projectController.createProject);
router.get('/', validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
]), projectController.getProjects);
router.get('/:id/invitations', projectController.listInvitations);
router.post('/:id/invite', validate([
  body('email').isEmail().isLength({ max: 254 }).normalizeEmail(),
]), projectController.inviteMember);
router.get('/:id', projectController.getProjectById);
router.put('/:id', validate([
  body('title').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 3000 }),
  body('status').optional().isIn(['active', 'completed', 'archived']),
]), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Members management
router.post('/:id/members', projectController.addMember);
router.get('/:id/members', projectController.listMembers);
router.delete('/:id/members/:memberId', projectController.removeMember);
router.post('/invitations/:token/accept', projectController.acceptInvitation);
router.post('/invitations/:token/reject', projectController.rejectInvitation);

module.exports = router;
