const crypto = require('crypto');

/**
 * CSRF Token Handlers
 * Implements stateless Double-Submit Cookie Pattern.
 */
const csrfTokenSetter = (req, res, next) => {
  const cookies = req.cookies || {};
  if (!cookies.csrfToken) {
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('csrfToken', csrfToken, {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    // Attach to request context
    req.csrfToken = csrfToken;
  } else {
    req.csrfToken = cookies.csrfToken;
  }
  next();
};

const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not require CSRF protection
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(req.method)) {
    return next();
  }

  // Public unauthenticated auth routes do not require CSRF validation
  const url = req.originalUrl || req.url || '';
  const isPublicAuthRoute = url.includes('/auth/login') ||
                            url.includes('/auth/register') ||
                            url.includes('/auth/google') ||
                            url.includes('/auth/forgot-password') ||
                            url.includes('/auth/reset-password') ||
                            url.includes('/auth/refresh');

  if (isPublicAuthRoute) {
    return next();
  }

  const cookies = req.cookies || {};
  const csrfCookie = cookies.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'CSRF validation failed: Invalid or missing token' });
  }

  next();
};

module.exports = {
  csrfTokenSetter,
  csrfProtection
};
