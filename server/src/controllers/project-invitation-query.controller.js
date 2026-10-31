const prisma = require('../config/prisma');
const { CLIENT_URL } = require('../config/env');
const logger = require('../utils/logger.util');

const buildInvitationUrl = (token) => `${CLIENT_URL}/project-invitations/${token}`;
exports.listInvitations = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    const invitations = await prisma.projectInvitation.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedUser: { select: { id: true, username: true, email: true, avatar: true } },
      },
    });

    res.json({ invitations });
  } catch (error) {
    logger.error('List invitations failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: { select: { id: true, title: true, description: true, owner: { select: { id: true, username: true, email: true } } } },
        inviter: { select: { id: true, username: true, email: true } },
        invitedUser: { select: { id: true, username: true, email: true, avatar: true } },
      },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'This invitation is invalid or no longer available.' });
    }

    if (invitation.status === 'pending' && invitation.expiresAt < new Date()) {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      invitation.status = 'expired';
    }

    return res.json({
      invitation: {
        ...invitation,
        inviteUrl: buildInvitationUrl(invitation.token),
      },
    });
  } catch (error) {
    logger.error('Get invitation failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};
