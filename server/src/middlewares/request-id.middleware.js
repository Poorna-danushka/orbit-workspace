const crypto = require('crypto');

/**
 * Request ID Middleware
 *
 * Generates a unique ID for each request and attaches it to:
 * - req.id (for use in logging and error handlers)
 * - X-Request-Id response header (for client-side tracking)
 *
 * The client can read this header if CORS exposedHeaders includes it.
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = { requestIdMiddleware };
