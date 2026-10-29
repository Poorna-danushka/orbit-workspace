const multer = require('multer');
const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');

/**
 * Normalize express-validator errors to standard format
 */
const normalizeValidationErrors = (errors) => {
  return errors.map((err) => ({
    field: err.path || err.param || 'unknown',
    message: err.msg || 'Invalid value',
    msg: err.msg || 'Invalid value', // Keep for frontend compatibility (temporary)
  }));
};

/**
 * Normalize Prisma errors
 */
const normalizePrismaError = (err) => {
  // P2002: Unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    const fieldStr = Array.isArray(fields) ? fields.join(', ') : 'field';
    return AppError.conflict(
      `A record with this ${fieldStr} already exists`,
      ErrorCodes.CONFLICT
    );
  }

  // P2025: Record not found (operation failed)
  if (err.code === 'P2025') {
    return AppError.notFound(ErrorCodes.NOT_FOUND, 'The requested resource was not found');
  }

  // P2003: Foreign key constraint violation
  if (err.code === 'P2003') {
    return AppError.badRequest(
      ErrorCodes.INVALID_INPUT,
      'Invalid reference: related resource does not exist'
    );
  }

  // P2014: Invalid ID format
  if (err.code === 'P2014') {
    return AppError.badRequest(ErrorCodes.INVALID_INPUT, 'Invalid ID format');
  }

  // Other Prisma errors
  return AppError.internal(ErrorCodes.DATABASE_ERROR, 'Database operation failed');
};

/**
 * Global Error Handler
 *
 * Normalizes all errors into the standard contract:
 * {
 *   status: number,
 *   code: string,
 *   message: string,
 *   errors?: Array<{field, message, msg}>,
 *   requestId: string
 * }
 */
const errorHandler = (err, req, res, next) => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.id || 'unknown';
  const isProduction = process.env.NODE_ENV === 'production';

  let error = err;

  // Normalize known error types to AppError
  if (!(error instanceof AppError)) {
    // JWT Errors
    if (error instanceof TokenExpiredError) {
      error = AppError.unauthorized(
        ErrorCodes.AUTH_TOKEN_EXPIRED,
        'Your session has expired. Please sign in again.'
      );
    } else if (error instanceof JsonWebTokenError) {
      error = AppError.unauthorized(
        ErrorCodes.AUTH_TOKEN_INVALID,
        'Invalid authentication token'
      );
    } else if (error instanceof NotBeforeError) {
      error = AppError.unauthorized(
        ErrorCodes.AUTH_TOKEN_INVALID,
        'Token is not yet valid'
      );
    }

    // Multer (Upload) Errors
    else if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        error = AppError.badRequest(
          ErrorCodes.UPLOAD_FILE_TOO_LARGE,
          'File size exceeds the allowed limit'
        );
      } else {
        error = AppError.badRequest(ErrorCodes.UPLOAD_ERROR, error.message || 'File upload failed');
      }
    }

    // Custom file validation errors (from multer fileFilter)
    else if (error.message && error.message.toLowerCase().includes('invalid file type')) {
      error = AppError.badRequest(ErrorCodes.UPLOAD_INVALID_FILE_TYPE, error.message);
    }

    // CORS Errors
    else if (error.message === 'CORS policy violation: origin not allowed') {
      error = AppError.forbidden(ErrorCodes.FORBIDDEN, 'Origin not allowed');
    }

    // Prisma/Database Errors
    else if (error.name === 'PrismaClientKnownRequestError') {
      error = normalizePrismaError(error);
    }
    else if (error.name === 'PrismaClientValidationError') {
      error = AppError.badRequest(ErrorCodes.INVALID_INPUT, 'Invalid data provided');
    }
    else if (error.name === 'PrismaClientInitializationError') {
      error = AppError.serviceUnavailable(
        'Database connection failed',
        ErrorCodes.SERVICE_UNAVAILABLE
      );
    }

    // JSON Parse Errors (malformed request body)
    else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      error = AppError.badRequest(ErrorCodes.BAD_REQUEST, 'Invalid JSON in request body');
    }

    // Payload Too Large (body-parser/express-json)
    else if (
      error.status === 413 || 
      error.code === 'ENTITY_TOO_LARGE' || 
      error.type === 'entity.too.large'
    ) {
      error = new AppError('Request payload is too large', 413, ErrorCodes.PAYLOAD_TOO_LARGE);
    }

    // Unknown errors -> Internal Server Error
    else {
      // Log the full error for debugging
      console.error('Unhandled error:', {
        requestId,
        name: error.name,
        message: error.message,
        code: error.code,
        type: error.type,
        stack: isProduction ? undefined : error.stack,
      });

      error = AppError.internal('An unexpected error occurred', ErrorCodes.INTERNAL_ERROR);
    }
  }

  // Log operational errors (less verbose)
  if (error.isOperational && error.status >= 500) {
    console.error('Operational error:', {
      requestId,
      code: error.code,
      message: error.message,
      status: error.status,
    });
  }

  // Build response
  const response = {
    status: error.status || 500,
    code: error.code || ErrorCodes.INTERNAL_ERROR,
    message: error.message || 'Internal server error',
    requestId,
  };

  // Add validation errors if present
  if (error.validationErrors && Array.isArray(error.validationErrors)) {
    response.errors = error.validationErrors;
  }

  // Set X-Request-Id header
  res.set('X-Request-Id', requestId);

  res.status(response.status).json(response);
};

module.exports = errorHandler;
