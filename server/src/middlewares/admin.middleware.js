const prisma = require('../config/prisma');
const { verifyAccessToken } = require('../utils/token.util');

const verifyAdmin = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }

  const userId = decoded.sub || decoded.userId;
  if (typeof userId !== 'string') {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
  } catch (error) {
    console.error('Admin account lookup failed:', error);
    return res.status(503).json({ message: 'Authentication service unavailable' });
  }

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.user = { userId: user.id, role: user.role };
  return next();
};

module.exports = { verifyAdmin };
