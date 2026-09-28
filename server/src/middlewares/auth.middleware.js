const { verifyAccessToken } = require('../utils/token.util');
const prisma = require('../config/prisma');

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }

  const userId = decoded.sub || decoded.userId;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) return res.status(401).json({ message: 'Account is no longer available' });
    req.user = { userId: user.id, role: user.role };
    return next();
  } catch (error) {
    console.error('Authentication account lookup failed:', error);
    return res.status(503).json({ message: 'Authentication service unavailable' });
  }
};

module.exports = { verifyToken };
