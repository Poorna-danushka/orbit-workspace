const cookie = require('cookie');
const { verifyAccessToken } = require('../utils/token.util');
const { TokenExpiredError } = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ErrorCodes = require('../utils/error-codes');
const logger = require('../utils/logger.util');

const authenticateSocket = async (socket, next) => {
  let decoded;
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.accessToken;
    if (!token) {
      const err = new Error('Authentication required');
      err.data = { code: ErrorCodes.AUTH_TOKEN_MISSING };
      return next(err);
    }

    decoded = verifyAccessToken(token);
  } catch (error) {
    const err = new Error('Invalid or expired authentication token');
    if (error instanceof TokenExpiredError) {
      err.data = { code: ErrorCodes.AUTH_TOKEN_EXPIRED };
    } else {
      err.data = { code: ErrorCodes.AUTH_TOKEN_INVALID };
    }
    next(err);
    return;
  }

  try {
    const userId = decoded.sub || decoded.userId;
    if (typeof userId !== 'string' || typeof decoded.exp !== 'number') {
      const err = new Error('Invalid or expired authentication token');
      err.data = { code: ErrorCodes.AUTH_TOKEN_INVALID };
      return next(err);
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      const err = new Error('Account is no longer available');
      err.data = { code: ErrorCodes.AUTH_USER_NOT_FOUND };
      return next(err);
    }

    socket.data.userId = user.id;
    socket.data.authExpiresAt = decoded.exp * 1000;
    return next();
  } catch (error) {
    logger.error('Socket account authentication failed', error);
    const err = new Error('Authentication service unavailable');
    err.data = { code: ErrorCodes.SERVICE_UNAVAILABLE };
    return next(err);
  }
};

module.exports = { authenticateSocket };
