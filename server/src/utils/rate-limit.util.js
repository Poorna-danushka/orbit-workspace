const rateLimit = require('express-rate-limit');
const AppError = require('./AppError');
const ErrorCodes = require('./error-codes');

/**
 * Creates a rate limiter with standardized error handling
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {boolean} [options.standardHeaders=true] - Use standard rate limit headers
 * @param {boolean} [options.legacyHeaders=false] - Use legacy X-RateLimit-* headers
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
  return rateLimit({
    ...options,
    standardHeaders: options.standardHeaders ?? true,
    legacyHeaders: options.legacyHeaders ?? false,
    handler: (req, res, next) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.set('Retry-After', retryAfter);
      
      const error = AppError.tooManyRequests(
        ErrorCodes.RATE_LIMITED,
        'Too many requests. Please try again later.'
      );
      
      next(error);
    },
  });
};

module.exports = {
  createRateLimiter,
};
