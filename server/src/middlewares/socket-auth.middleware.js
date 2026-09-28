const cookie = require('cookie');
const { verifyAccessToken } = require('../utils/token.util');
const prisma = require('../config/prisma');

const authenticateSocket = async (socket, next) => {
  let decoded;
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.accessToken;
    if (!token) return next(new Error('Authentication required'));

    decoded = verifyAccessToken(token);
  } catch {
    next(new Error('Invalid or expired authentication token'));
    return;
  }

  try {
    const userId = decoded.sub || decoded.userId;
    if (typeof userId !== 'string' || typeof decoded.exp !== 'number') {
      return next(new Error('Invalid or expired authentication token'));
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return next(new Error('Account is no longer available'));
    socket.data.userId = user.id;
    socket.data.authExpiresAt = decoded.exp * 1000;
    return next();
  } catch (error) {
    console.error('Socket account authentication failed:', error);
    return next(new Error('Authentication service unavailable'));
  }
};

module.exports = { authenticateSocket };
