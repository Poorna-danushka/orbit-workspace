const { Server } = require('socket.io');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { authenticateSocket } = require('../middlewares/socket-auth.middleware');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()), methods: ['GET', 'POST'], credentials: true }
  });
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
     
    const canAccessProject = async (projectId) => {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        select: { id: true },
      });
      return Boolean(project);
    };

    socket.on('joinProject', async (projectId) => {
      if (typeof projectId === 'string' && await canAccessProject(projectId)) {
        socket.join(projectId);
      }
    });

    socket.on('joinChat', async (projectId) => {
      if (typeof projectId === 'string' && await canAccessProject(projectId)) {
        socket.join(projectId);
      }
    });

    socket.on('joinUser', (requestedUserId) => {
      if (requestedUserId === userId) socket.join(userId);
    });
     
    socket.on('taskUpdated', async (data) => {
      if (data?.projectId && await canAccessProject(data.projectId)) {
        socket.to(data.projectId).emit('taskChanged', data);
      }
    });

    socket.on('sendMessage', async (data, callback) => {
      try {
        if (!data?.projectId || !data?.content || !(await canAccessProject(data.projectId))) {
          return callback?.({ error: 'Invalid project or access denied' });
        }

        const content = String(data.content).trim().slice(0, 2000);
        if (!content) return;

        const message = await prisma.message.create({
          data: {
            projectId: data.projectId,
            senderId: userId,
            content,
          },
          include: {
            sender: {
              select: { id: true, username: true, avatar: true },
            },
          },
        });

        io.to(data.projectId).emit('messageReceived', message);
        callback?.({ ok: true });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        callback?.({ error: 'Unable to send message' });
      }
    });
     
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { initSocket, getIo };
