const env = require('../config/env');

const authCookieAttributes = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

const cookieOptions = () => ({
  ...authCookieAttributes,
  maxAge: env.REFRESH_TOKEN_TTL_MS,
});

const clearAllAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...authCookieAttributes });
  res.clearCookie('refreshToken', { ...authCookieAttributes });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, cookieOptions());
  res.cookie('refreshToken', refreshToken, cookieOptions());
};

const setAccessCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, cookieOptions());
};

module.exports = {
  clearAllAuthCookies,
  setAccessCookie,
  setAuthCookies,
};
