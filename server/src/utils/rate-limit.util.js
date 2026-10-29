const rateLimit = require('express-rate-limit');
const AppError = require('./AppError');
const ErrorCodes = require('./error-codes');

const createFixedWindowLimiter = ({ limit, windowMs, now = Date.now }) => {
  const buckets = new Map();

  return {
    allow(key) {
      const currentTime = now();
      let bucket = buckets.get(key);

      if (!bucket || currentTime - bucket.startedAt >= windowMs) {
        bucket = { startedAt: currentTime, count: 0 };
      }

      if (bucket.count >= limit) {
        buckets.set(key, bucket);
        return false;
      }

      bucket.count += 1;
      buckets.set(key, bucket);
      return true;
    },
    clear(key) {
      buckets.delete(key);
    },
  };
};

/**
 * Creates a rate limiter with standardized error handling
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} [options.message] - Custom error message
 * @param {boolean} [options.standardHeaders=true] - Use standard rate limit headers
 * @param {boolean} [options.legacyHeaders=false] - Use legacy X-RateLimit-* headers
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
  const customMessage = options.message;
  
  return rateLimit({
    ...options,
    standardHeaders: options.standardHeaders ?? true,
    legacyHeaders: options.legacyHeaders ?? false,
    handler: (req, res, next) => {
      // Calculate seconds until reset (minimum 1)
      const resetTime = req.rateLimit?.resetTime || new Date(Date.now() + options.windowMs);
      const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
      
      res.set('Retry-After', retryAfter);
      
      const error = AppError.tooManyRequests(
        ErrorCodes.RATE_LIMITED,
        customMessage || 'Too many requests. Please try again later.'
      );
      
      // Preserve requestId if present
      error.requestId = req.id;
      
      next(error);
    },
  });
};

module.exports = {
  createRateLimiter,
  createFixedWindowLimiter,
};
