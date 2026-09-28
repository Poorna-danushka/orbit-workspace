const { Server } = require('socket.io');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { authenticateSocket } = require('../middlewares/socket-auth.middleware');
const { createFixedWindowLimiter } = require('../utils/fixed-window-limiter.util');

let io;

const projectRoom = (projectId) => `project:${projectId}`;
const userRoom = (userId) => `user:${userId}`;
const messageLimiter = createFixedWindowLimiter({ limit: 30, windowMs: 60_000 });
const isAllowedSocketOrigin = (origin) => !origin || env.CORS_ORIGINS.includes(origin);

const acknowledge = (callback, payload) => {
  if (typeof callback === 'function') callback(payload);
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    allowRequest: (request, callback) => {
      const allowed = isAllowedSocketOrigin(request.headers.origin);
      callback(allowed ? null : 'Origin not allowed', allowed);
    },
  });
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const authExpiryTimer = setTimeout(
      () => socket.disconnect(true),
      Math.max(0, socket.data.authExpiresAt - Date.now()),
    );
    authExpiryTimer.unref();
    socket.join(userRoom(userId));

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

    const joinProjectRoom = async (projectId, callback) => {
      try {
        if (typeof projectId !== 'string' || !(await canAccessProject(projectId))) {
          acknowledge(callback, { error: 'Project access denied' });
          return;
        }
        await socket.join(projectRoom(projectId));
        acknowledge(callback, { ok: true });
      } catch (error) {
        console.error('Socket project room join failed:', error);
        acknowledge(callback, { error: 'Unable to join project room' });
      }
    };
    socket.on('joinProject', joinProjectRoom);
    socket.on('joinChat', joinProjectRoom);

    socket.on('joinUser', (requestedUserId) => {
      if (requestedUserId === userId) socket.join(userRoom(userId));
    });
     
    socket.on('sendMessage', async (data, callback) => {
      try {
        if (
          typeof data?.projectId !== 'string' ||
          typeof data?.content !== 'string' ||
          !data.content.trim()
        ) {
          return acknowledge(callback, { error: 'Invalid project or access denied' });
        }

        if (!messageLimiter.allow(userId)) {
          return acknowledge(callback, { error: 'Message rate limit exceeded. Try again shortly.' });
        }

        if (!(await canAccessProject(data.projectId))) {
          return acknowledge(callback, { error: 'Invalid project or access denied' });
        }

        const content = data.content.trim().slice(0, 2000);
        if (!content) return acknowledge(callback, { error: 'Message cannot be empty' });

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

        io.to(projectRoom(data.projectId)).emit('messageReceived', message);
        acknowledge(callback, { ok: true });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        acknowledge(callback, { error: 'Unable to send message' });
      }
    });
     
    socket.on('disconnect', () => {
      clearTimeout(authExpiryTimer);
      console.log('User disconnected:', socket.id);
      void io.in(userRoom(userId)).fetchSockets()
        .then((activeSockets) => {
          if (activeSockets.length === 0) messageLimiter.clear(userId);
        })
        .catch((error) => console.error('Socket rate-limit cleanup failed:', error?.message || error));
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

const getProjectRoom = projectRoom;
const getUserRoom = userRoom;

const revokeProjectRoomAccess = async (projectId, userId) => {
  if (!io) return;
  const room = projectRoom(projectId);
  const sockets = await io.in(room).fetchSockets();
  await Promise.all(
    sockets
      .filter((socket) => socket.data.userId === userId)
      .map((socket) => socket.leave(room))
  );
};

const disconnectUser = async (userId) => {
  if (!io) return;
  const sockets = await io.fetchSockets();
  await Promise.all(
    sockets
      .filter((socket) => socket.data.userId === userId)
      .map((socket) => socket.disconnect(true))
  );
};

module.exports = {
  initSocket,
  getIo,
  getProjectRoom,
  getUserRoom,
  revokeProjectRoomAccess,
  disconnectUser,
  isAllowedSocketOrigin,
};
