const cookie = require('cookie');
const { verifyAccessToken } = require('../utils/token.util');

const authenticateSocket = (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.accessToken;
    if (!token) return next(new Error('Authentication required'));

    const decoded = verifyAccessToken(token);
    socket.data.userId = decoded.sub || decoded.userId;
    next();
  } catch {
    next(new Error('Invalid or expired authentication token'));
  }
};

module.exports = { authenticateSocket };
