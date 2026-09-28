const crypto = require('crypto');

const csrfSecret = process.env.JWT_SECRET || 'orbit-csrf-secret';

const createCsrfToken = () => {
  const nonce = crypto.randomBytes(24).toString('hex');
  const signature = crypto
    .createHmac('sha256', csrfSecret)
    .update(nonce)
    .digest('hex');
  return `${nonce}.${signature}`;
};

const isValidSignedToken = (token) => {
  if (typeof token !== 'string') return false;
  const separator = token.indexOf('.');
  if (separator <= 0) return false;

  const nonce = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = crypto
    .createHmac('sha256', csrfSecret)
    .update(nonce)
    .digest('hex');

  return signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

/**
 * CSRF Token Handlers
 * Implements stateless Double-Submit Cookie Pattern.
 */
const csrfTokenSetter = (req, res, next) => {
  const cookies = req.cookies || {};
  if (!cookies.csrfToken) {
    const csrfToken = createCsrfToken();
    const secureCookies =
      process.env.NODE_ENV === 'production' ||
      (process.env.CLIENT_URL || '')
        .split(',')
        .some((origin) => origin.trim().startsWith('https://'));

    res.cookie('csrfToken', csrfToken, {
      secure: secureCookies,
      sameSite: secureCookies ? 'none' : 'lax',
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

  const cookieMatches = csrfCookie && csrfHeader && csrfCookie === csrfHeader;
  if (!cookieMatches && !isValidSignedToken(csrfHeader)) {
    return res.status(403).json({ message: 'CSRF validation failed: Invalid or missing token' });
  }

  next();
};

module.exports = {
  csrfTokenSetter,
  csrfProtection
};
