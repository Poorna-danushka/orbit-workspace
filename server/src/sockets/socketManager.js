const { Server } = require('socket.io');
const prisma = require('../config/prisma');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
     
    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
    });

    socket.on('joinChat', (projectId) => {
      socket.join(projectId);
    });

    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room: ${userId}`);
    });
     
    socket.on('taskUpdated', (data) => {
      socket.to(data.projectId).emit('taskChanged', data);
    });

    socket.on('sendMessage', async (data) => {
      try {
        if (!data?.projectId || !data?.senderId || !data?.content) {
          return;
        }

        const content = String(data.content).trim().slice(0, 2000);
        if (!content) return;

        const message = await prisma.message.create({
          data: {
            projectId: data.projectId,
            senderId: data.senderId,
            content,
          },
          include: {
            sender: {
              select: { id: true, username: true, avatar: true },
            },
          },
        });

        io.to(data.projectId).emit('messageReceived', message);
      } catch (error) {
        console.error('Socket sendMessage error:', error);
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
