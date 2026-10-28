const prisma = require('../config/prisma');
const { verifyAccessToken } = require('../utils/token.util');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw AppError.unauthorized(
        ErrorCodes.AUTH_TOKEN_MISSING,
        'No authorization token provided'
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      // Let JWT errors bubble to global handler
      throw error;
    }

    const userId = decoded.sub || decoded.userId;
    if (typeof userId !== 'string') {
      throw AppError.unauthorized(
        ErrorCodes.AUTH_TOKEN_INVALID,
        'Invalid token payload'
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'admin') {
      throw AppError.forbidden(
        ErrorCodes.FORBIDDEN,
        'Admin access required'
      );
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    // Database connection errors
    if (error.name && error.name.startsWith('Prisma')) {
      return next(AppError.serviceUnavailable(
        'Authentication service unavailable',
        ErrorCodes.SERVICE_UNAVAILABLE
      ));
    }
    next(error);
  }
};

module.exports = { verifyAdmin };
