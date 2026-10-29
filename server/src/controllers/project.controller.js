const prisma = require('../config/prisma');
const logger = require('../utils/logger.util');
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
    logger.error('Create project failed', error);
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
    logger.error('Get projects failed', error);
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
    logger.error('Get project failed', error);
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
    logger.error('Update project failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const project = await prisma.project.findUnique({ where: { id }, select: { ownerId: true } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.ownerId !== userId) return res.status(403).json({ message: 'Only the project owner can delete it' });

    const tasks = await prisma.task.findMany({ where: { projectId: id }, select: { id: true } });
    const taskIds = tasks.map(({ id: taskId }) => taskId);
    await prisma.$transaction([
      prisma.attachment.deleteMany({
        where: { OR: [{ projectId: id }, { taskId: { in: taskIds } }] },
      }),
      prisma.projectInvitation.deleteMany({ where: { projectId: id } }),
      prisma.message.deleteMany({ where: { projectId: id } }),
      prisma.projectMember.deleteMany({ where: { projectId: id } }),
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Delete project failed', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Project members management (owner only)
