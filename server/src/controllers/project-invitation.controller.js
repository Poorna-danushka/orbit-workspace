const prisma = require('../config/prisma');
const { CLIENT_URL } = require('../config/env');
const { generatePasswordResetToken } = require('../utils/token.util');
const { sendProjectInvitationEmail } = require('../services/email.service');
const logger = require('../utils/logger.util');
const { getIo, getProjectRoom, getUserRoom } = require('../sockets/socketManager');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
const buildInvitationUrl = (token) => `${CLIENT_URL}/project-invitations/${token}`;
exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;
    const { email } = req.body;
    const invitedEmail = normalizeEmail(email);

    if (!invitedEmail) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: { select: { id: true, username: true, email: true } }, members: { include: { user: { select: { id: true, email: true } } } } },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== ownerId) return res.status(403).json({ message: 'Only project owner can invite members' });

    const invitedUser = await prisma.user.findUnique({ where: { email: invitedEmail } });

    if (invitedUser) {
      const isAlreadyMember = project.members.some((member) => member.userId === invitedUser.id) || project.ownerId === invitedUser.id;
      if (isAlreadyMember) return res.status(409).json({ message: 'This user is already a member of the project.' });
    }

    const existingInvitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId: id,
        invitedEmail,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingInvitation) {
      return res.status(200).json({
        message: 'A pending invitation already exists for this email.',
        invitation: existingInvitation,
      });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = generatePasswordResetToken();
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId: id,
        inviterId: ownerId,
        invitedUserId: invitedUser ? invitedUser.id : null,
        invitedEmail,
        token,
        status: 'pending',
        expiresAt,
      },
      include: {
        project: { select: { id: true, title: true } },
        inviter: { select: { id: true, username: true, email: true } },
      },
    });

    if (invitedUser) {
      await prisma.notification.create({
        data: {
          userId: invitedUser.id,
          message: `${project.owner.username || 'A project owner'} invited you to join "${project.title}".`,
        },
      });
    }

    try {
      await sendProjectInvitationEmail({
        to: invitedEmail,
        projectName: project.title,
        inviterName: project.owner.username || 'Orbit project owner',
        inviteUrl: buildInvitationUrl(token),
        invitedEmail,
        expiresAt,
      });

      if (invitedUser) {
        const io = getIo();
        io.to(getUserRoom(invitedUser.id)).emit('notificationReceived');
      }

      res.status(201).json({
        message: invitedUser ? 'Invitation sent successfully.' : 'Invitation email sent successfully.',
        invitation,
      });
    } catch (mailError) {
      logger.error('Project invitation email delivery failed', mailError);
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return res.status(502).json({
        message: 'Invitation was created but the email could not be delivered. Please try again.',
      });
    }
  } catch (error) {
    logger.error('Invite member failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Please sign in to accept this invitation.' });
    }

    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: { select: { id: true, title: true, ownerId: true } },
      },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'This invitation is invalid or no longer available.' });
    }

    if (invitation.status === 'accepted') {
      return res.status(409).json({ message: 'You have already accepted this invitation.' });
    }

    if (invitation.status === 'rejected') {
      return res.status(409).json({ message: 'This invitation was previously rejected.' });
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return res.status(410).json({ message: 'This invitation has expired.' });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser) return res.status(404).json({ message: 'User not found.' });

    if (currentUser.email.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is for a different email address.' });
    }

    const existingMembership = await prisma.projectMember.findFirst({
      where: { projectId: invitation.projectId, userId: currentUserId },
    });

    if (existingMembership) {
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted', invitedUserId: currentUserId },
      });
      return res.status(409).json({ message: 'You are already a member of this project.' });
    }

    await prisma.$transaction([
      prisma.projectMember.create({
        data: { projectId: invitation.projectId, userId: currentUserId, role: 'member' },
      }),
      prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted', invitedUserId: currentUserId },
      }),
      prisma.notification.create({
        data: {
          userId: invitation.inviterId,
          message: `${currentUser.username} joined project "${invitation.project.title}".`,
        },
      }),
    ]);

    try {
      const io = getIo();
      io.to(getProjectRoom(invitation.projectId)).emit('memberAdded', { projectId: invitation.projectId, userId: currentUserId });
      io.to(getUserRoom(currentUserId)).emit('projectAdded', { projectId: invitation.projectId });
      io.to(getUserRoom(currentUserId)).emit('notificationReceived');
      io.to(getUserRoom(invitation.inviterId)).emit('notificationReceived');
    } catch (socketErr) {
      logger.error('Socket emission failed on invitation acceptance', socketErr);
    }

    res.json({ message: 'Invitation accepted successfully.' });
  } catch (error) {
    logger.error('Accept invitation failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Please sign in to respond to this invitation.' });
    }

    const invitation = await prisma.projectInvitation.findUnique({ where: { token } });
    if (!invitation) {
      return res.status(404).json({ message: 'This invitation is invalid or no longer available.' });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUser || currentUser.email.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
      return res.status(403).json({ message: 'You cannot respond to this invitation.' });
    }

    if (invitation.status !== 'pending') {
      return res.status(409).json({ message: `This invitation has already been ${invitation.status}.` });
    }

    await prisma.$transaction([
      prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'rejected' },
      }),
      prisma.notification.create({
        data: {
          userId: invitation.inviterId,
          message: `${currentUser.username} declined your invitation to join the project.`,
        },
      }),
    ]);

    res.json({ message: 'Invitation rejected.' });
  } catch (error) {
    logger.error('Reject invitation failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};
