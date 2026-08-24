const prisma = require('../config/prisma');

const getProjectMessages = async (req, res, next) => {
  try {
    const projectId = String(req.params.projectId || '').trim();
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!projectId) {
      return res.status(400).json({ message: 'Project id is required' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    try {
      const messages = await prisma.message.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
        take: 100,
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
        },
      });

      return res.json(messages);
    } catch (dbError) {
      if (dbError?.code === 'P2021' || dbError?.message?.includes('does not exist')) {
        return res.json([]);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Get project messages error:', error);
    next(error);
  }
};

module.exports = { getProjectMessages };
