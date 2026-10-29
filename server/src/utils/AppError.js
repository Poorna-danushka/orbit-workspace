const ErrorCodes = require('./error-codes');

/**
 * Application Error Class
 *
 * Standardized error for operational (expected) failures.
 * Distinguishes operational errors (bad input, not found, unauthorized)
 * from programmer errors (bugs, unhandled exceptions).
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message (safe to show users)
   * @param {number} status - HTTP status code
   * @param {string} code - Error code from error-codes.js
   * @param {Array<{field: string, message: string}>} [validationErrors] - Optional validation errors
   */
  constructor(message, status, code, validationErrors = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
    this.isOperational = true;

    // In development/test, validate that code is from ErrorCodes to catch swapped arguments
    if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')) {
      const validCodes = Object.values(ErrorCodes);
      if (!validCodes.includes(code)) {
        throw new TypeError(
          `Invalid error code: "${code}". Must be one of: ${validCodes.join(', ')}`
        );
      }
    }

    // Capture stack trace (V8 only, safe in other engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Factory: 400 Bad Request
   * @param {string} code - Error code
   * @param {string} [message='Bad request'] - Human-readable message
   */
  static badRequest(code, message = 'Bad request') {
    return new AppError(message, 400, code);
  }

  /**
   * Factory: 401 Unauthorized
   * @param {string} code - Error code
   * @param {string} [message='Unauthorized'] - Human-readable message
   */
  static unauthorized(code, message = 'Unauthorized') {
    return new AppError(message, 401, code);
  }

  /**
   * Factory: 403 Forbidden
   * @param {string} [code='FORBIDDEN'] - Error code
   * @param {string} [message='Access denied'] - Human-readable message
   */
  static forbidden(code = 'FORBIDDEN', message = 'Access denied') {
    return new AppError(message, 403, code);
  }

  /**
   * Factory: 404 Not Found
   * @param {string} [code='NOT_FOUND'] - Error code
   * @param {string} [message='Resource not found'] - Human-readable message
   */
  static notFound(code = 'NOT_FOUND', message = 'Resource not found') {
    return new AppError(message, 404, code);
  }

  /**
   * Factory: 409 Conflict
   * @param {string} [code='CONFLICT'] - Error code
   * @param {string} [message='Resource conflict'] - Human-readable message
   */
  static conflict(code = 'CONFLICT', message = 'Resource conflict') {
    return new AppError(message, 409, code);
  }

  /**
   * Factory: 422 Validation Error
   * @param {string} [code='VALIDATION_ERROR'] - Error code
   * @param {string} message - Human-readable message
   * @param {Array<{field: string, message: string}>} validationErrors - Field-level errors
   */
  static validation(code = 'VALIDATION_ERROR', message, validationErrors) {
    return new AppError(message, 422, code, validationErrors);
  }

  /**
   * Factory: 429 Too Many Requests
   * @param {string} [code='RATE_LIMITED'] - Error code
   * @param {string} [message='Too many requests'] - Human-readable message
   */
  static tooManyRequests(code = 'RATE_LIMITED', message = 'Too many requests') {
    return new AppError(message, 429, code);
  }

  /**
   * Factory: 500 Internal Server Error
   * @param {string} [code='INTERNAL_ERROR'] - Error code
   * @param {string} [message='Internal server error'] - Human-readable message
   */
  static internal(code = 'INTERNAL_ERROR', message = 'Internal server error') {
    return new AppError(message, 500, code);
  }

  /**
   * Factory: 503 Service Unavailable
   * @param {string} [code='SERVICE_UNAVAILABLE'] - Error code
   * @param {string} [message='Service unavailable'] - Human-readable message
   */
  static serviceUnavailable(code = 'SERVICE_UNAVAILABLE', message = 'Service unavailable') {
    return new AppError(message, 503, code);
  }
}

module.exports = AppError;
