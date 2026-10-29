const prisma = require('../config/prisma');
const logger = require('../utils/logger.util');
const { getIo, getProjectRoom, getUserRoom, revokeProjectRoomAccess } = require('../sockets/socketManager');
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
      io.to(getProjectRoom(id)).emit('memberAdded', member);
      io.to(getUserRoom(newMemberId)).emit('projectAdded', { projectId: id });
      io.to(getUserRoom(newMemberId)).emit('notificationReceived');
    } catch (socketErr) {
      logger.error('Socket emission failed while adding a member', socketErr);
    }

    res.status(201).json(member);
  } catch (error) {
    logger.error('Add member failed', error);
    if (error.code === 'P2002') return res.status(409).json({ message: 'User is already a member' });
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
    logger.error('List members failed', error);
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
      io.to(getProjectRoom(id)).emit('memberRemoved', { projectId: id, userId: memberId });
      await revokeProjectRoomAccess(id, memberId);
      io.to(getUserRoom(memberId)).emit('projectRemoved', { projectId: id });
      io.to(getUserRoom(memberId)).emit('notificationReceived');
    } catch (socketErr) {
      logger.error('Socket emission failed while removing a member', socketErr);
    }

    res.json({ message: 'Member removed and tasks unassigned' });
  } catch (error) {
    logger.error('Remove member failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};
