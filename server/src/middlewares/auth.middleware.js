const { verifyAccessToken } = require('../utils/token.util');
const { TokenExpiredError } = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');

const verifyToken = async (req, res, next) => {
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
      // JWT library will throw TokenExpiredError or JsonWebTokenError
      // Let these bubble up to the global error handler for proper code assignment
      throw error;
    }

    const userId = decoded.sub || decoded.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw AppError.unauthorized(
        ErrorCodes.AUTH_USER_NOT_FOUND,
        'Account is no longer available'
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
    // AppError or JWT errors pass through to global handler
    next(error);
  }
};

module.exports = { verifyToken };
