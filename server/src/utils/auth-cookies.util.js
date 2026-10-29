const env = require('../config/env');

const authCookieAttributes = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
  path: '/',
};

const cookieOptions = (days) => ({
  ...authCookieAttributes,
  maxAge: days * 24 * 60 * 60 * 1000,
});

const clearAllAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...authCookieAttributes });
  res.clearCookie('refreshToken', { ...authCookieAttributes });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, cookieOptions(1 / 24));
  res.cookie('refreshToken', refreshToken, cookieOptions(7));
};

const setAccessCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, cookieOptions(1 / 24));
};

module.exports = {
  clearAllAuthCookies,
  setAccessCookie,
  setAuthCookies,
};
