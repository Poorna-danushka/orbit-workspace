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

    // Capture stack trace (V8 only, safe in other engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Factory: 400 Bad Request
   */
  static badRequest(code, message = 'Bad request') {
    return new AppError(message, 400, code);
  }

  /**
   * Factory: 401 Unauthorized
   */
  static unauthorized(code, message = 'Unauthorized') {
    return new AppError(message, 401, code);
  }

  /**
   * Factory: 403 Forbidden
   */
  static forbidden(code = 'FORBIDDEN', message = 'Access denied') {
    return new AppError(message, 403, code);
  }

  /**
   * Factory: 404 Not Found
   */
  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  /**
   * Factory: 409 Conflict
   */
  static conflict(message = 'Resource conflict', code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  /**
   * Factory: 422 Validation Error
   */
  static validation(message, validationErrors, code = 'VALIDATION_ERROR') {
    return new AppError(message, 422, code, validationErrors);
  }

  /**
   * Factory: 429 Too Many Requests
   */
  static tooManyRequests(code = 'RATE_LIMITED', message = 'Too many requests') {
    return new AppError(message, 429, code);
  }

  /**
   * Factory: 500 Internal Server Error
   */
  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }

  /**
   * Factory: 503 Service Unavailable
   */
  static serviceUnavailable(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, code);
  }
}

module.exports = AppError;
