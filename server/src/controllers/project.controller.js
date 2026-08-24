const prisma = require('../config/prisma');
const { CLIENT_URL } = require('../config/env');
const { generatePasswordResetToken } = require('../utils/token.util');
const { sendProjectInvitationEmail } = require('../services/email.service');
const { getIo } = require('../sockets/socketManager');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
const buildInvitationUrl = (token) => {
  const baseUrl = (CLIENT_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/$/, '');
  return `${baseUrl}/project-invitations/${token}`;
};

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;
    const project = await prisma.project.create({
      data: { title, description, ownerId: userId },
      include: { _count: { select: { tasks: true } } },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get projects where user is owner or a member
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { tasks: true } },
          owner: { select: { id: true, username: true, email: true, avatar: true } },
          members: { include: { user: { select: { id: true, username: true, email: true, avatar: true } } } },
        },
      }),
      prisma.project.count({ where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] } }),
    ]);

    res.json({ data: projects, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single project if owner or member
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { 
        tasks: { orderBy: { dueDate: 'asc' } }, 
        owner: { select: { id: true, username: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, username: true, email: true, avatar: true } } } } 
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found or access denied' });
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.userId;
    const result = await prisma.project.updateMany({
      where: { id, ownerId: userId },
      data: { title, description, status },
    });
    if (result.count === 0) return res.status(404).json({ message: 'Project not found or unauthorized' });
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    // Cascade delete: tasks first, then project
    await prisma.task.deleteMany({ where: { projectId: id } });
    const result = await prisma.project.deleteMany({ where: { id, ownerId: userId } });
    if (result.count === 0) return res.status(404).json({ message: 'Project not found or unauthorized' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Project members management (owner only)
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const ownerId = req.user.userId;
    const { userId: newMemberId, role } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== ownerId) return res.status(403).json({ message: 'Only project owner can add members' });

    // Validate that user exists
    const userExists = await prisma.user.findUnique({ where: { id: newMemberId } });
    if (!userExists) return res.status(404).json({ message: 'User not found' });

    // Validate user is not the owner
    if (newMemberId === project.ownerId) {
      return res.status(400).json({ message: 'Project owner cannot be added as a member' });
    }

    // Validate user is not already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: { projectId: id, userId: newMemberId }
    });
    if (existingMember) return res.status(409).json({ message: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId: id, userId: newMemberId, role },
      include: { user: { select: { id: true, username: true, email: true, avatar: true } } }
    });

    // Create notification for the new member
    await prisma.notification.create({
      data: {
        userId: newMemberId,
        message: `You have been added to project: "${project.title}"`
      }
    });

    // Emit socket event to project room and the newly added user room
    try {
      const io = getIo();
      io.to(id).emit('memberAdded', member);
      io.to(newMemberId).emit('projectAdded', { projectId: id });
      io.to(newMemberId).emit('notificationReceived');
    } catch (socketErr) {
      console.error('Socket emission failed in addMember:', socketErr);
    }

    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    if (error.code === 'P2002') return res.status(409).json({ message: 'User is already a member' });
    res.status(500).json({ message: 'Server error' });
  }
};

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
        io.to(invitedUser.id).emit('notificationReceived');
      }

      res.status(201).json({
        message: invitedUser ? 'Invitation sent successfully.' : 'Invitation email sent successfully.',
        invitation,
      });
    } catch (mailError) {
      console.error('Project invitation email send failed:', mailError);
      await prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return res.status(502).json({
        message: 'Invitation was created but the email could not be delivered. Please try again.',
      });
    }
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error('List invitations error:', error);
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
    console.error('Get invitation error:', error);
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
      io.to(invitation.projectId).emit('memberAdded', { projectId: invitation.projectId, userId: currentUserId });
      io.to(currentUserId).emit('projectAdded', { projectId: invitation.projectId });
      io.to(currentUserId).emit('notificationReceived');
      io.to(invitation.inviterId).emit('notificationReceived');
    } catch (socketErr) {
      console.error('Socket emission failed on invitation acceptance:', socketErr);
    }

    res.json({ message: 'Invitation accepted successfully.' });
  } catch (error) {
    console.error('Accept invitation error:', error);
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
    console.error('Reject invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listMembers = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const userId = req.user.userId;

    const project = await prisma.project.findFirst({ where: { id, OR: [{ ownerId: userId }, { members: { some: { userId } } }] } });
    if (!project) return res.status(404).json({ message: 'Project not found or access denied' });

    const members = await prisma.projectMember.findMany({ where: { projectId: id }, include: { user: { select: { id: true, username: true, email: true, avatar: true } } } });
    res.json(members);
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params; // id = project id
    const ownerId = req.user.userId;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== ownerId) return res.status(403).json({ message: 'Only project owner can remove members' });

    const result = await prisma.projectMember.deleteMany({ where: { projectId: id, userId: memberId } });
    if (result.count === 0) return res.status(404).json({ message: 'Member not found' });

    // Unassign tasks assigned to this user in this project
    await prisma.task.updateMany({
      where: { projectId: id, assignedTo: memberId },
      data: { assignedTo: null }
    });

    // Create notification for the removed member
    await prisma.notification.create({
      data: {
        userId: memberId,
        message: `You have been removed from project: "${project.title}"`
      }
    });

    // Emit socket event to project room and the removed user room
    try {
      const io = getIo();
      io.to(id).emit('memberRemoved', { projectId: id, userId: memberId });
      io.to(memberId).emit('projectRemoved', { projectId: id });
      io.to(memberId).emit('notificationReceived');
    } catch (socketErr) {
      console.error('Socket emission failed in removeMember:', socketErr);
    }

    res.json({ message: 'Member removed and tasks unassigned' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
