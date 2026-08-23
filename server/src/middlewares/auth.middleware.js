const { verifyAccessToken } = require('../utils/token.util');

const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.sub || decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
};

module.exports = { verifyToken };
