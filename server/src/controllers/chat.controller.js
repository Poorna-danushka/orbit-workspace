const prisma = require('../config/prisma');
const cloudinaryUrlPattern = /https:\/\/res\.cloudinary\.com\/[^\s<>"']+/g;

const sanitizeMessageContent = (content, attachmentPaths) => content.replace(
  cloudinaryUrlPattern,
  (url) => attachmentPaths.get(url) || '[Attachment unavailable]',
);

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

    const messages = await prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });

    const attachments = await prisma.attachment.findMany({
      where: { projectId },
      select: { id: true, fileUrl: true },
    });
    const attachmentPaths = new Map(
      attachments.map(({ id, fileUrl }) => [fileUrl, `/api/uploads/${id}/content`]),
    );

    return res.json(messages.map((message) => ({
      ...message,
      content: sanitizeMessageContent(message.content, attachmentPaths),
    })));
  } catch (error) {
    console.error('Get project messages error:', error);
    next(error);
  }
};

module.exports = { getProjectMessages, sanitizeMessageContent };
