const crypto = require('node:crypto');
const prisma = require('../config/prisma');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');
const { setAuthCookies } = require('../utils/auth-cookies.util');
const {
  createGoogleAuthorizationRequest,
  verifyGoogleAuthorizationCode,
} = require('../services/google-oauth.service');
const { resolveGoogleAccount } = require('../services/google-account.service');
const { getSafeNextPath, hasMatchingOAuthState } = require('../utils/google-oauth-security.util');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');
const env = require('../config/env');
const logger = require('../utils/logger.util');

const GOOGLE_OAUTH_COOKIE_NAMES = [
  'googleOAuthState',
  'googleOAuthNonce',
  'googleOAuthCodeVerifier',
  'googleOAuthNext',
];
const googleOAuthCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 10 * 60 * 1000,
};

const clearGoogleOAuthCookies = (res) => {
  const options = { ...googleOAuthCookieOptions };
  delete options.maxAge;
  for (const name of GOOGLE_OAUTH_COOKIE_NAMES) {
    res.clearCookie(name, options);
  }
};

const redirectGoogleAuthError = (res) => {
  clearGoogleOAuthCookies(res);
  const redirectUrl = new URL('/login', env.CLIENT_URL);
  redirectUrl.searchParams.set('google', 'error');
  res.set('Cache-Control', 'no-store');
  res.set('Referrer-Policy', 'no-referrer');
  return res.redirect(303, redirectUrl.toString());
};

exports.startGoogleOAuth = async (req, res) => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    throw AppError.serviceUnavailable(ErrorCodes.SERVICE_UNAVAILABLE, 'Google sign-in is not configured');
  }

  const state = crypto.randomBytes(32).toString('base64url');
  const nonce = crypto.randomBytes(32).toString('base64url');
  const { authorizationUrl, codeVerifier } = await createGoogleAuthorizationRequest({ state, nonce });

  res.cookie('googleOAuthState', state, googleOAuthCookieOptions);
  res.cookie('googleOAuthNonce', nonce, googleOAuthCookieOptions);
  res.cookie('googleOAuthCodeVerifier', codeVerifier, googleOAuthCookieOptions);

  const nextPath = getSafeNextPath(req.query.next);
  if (nextPath) {
    res.cookie('googleOAuthNext', nextPath, googleOAuthCookieOptions);
  } else {
    const clearOptions = { ...googleOAuthCookieOptions };
    delete clearOptions.maxAge;
    res.clearCookie('googleOAuthNext', clearOptions);
  }

  res.set('Cache-Control', 'no-store');
  res.set('Referrer-Policy', 'no-referrer');
  return res.redirect(302, authorizationUrl);
};

exports.googleCallback = async (req, res) => {
  const state = req.query.state;
  const storedState = req.cookies?.googleOAuthState;
  const nonce = req.cookies?.googleOAuthNonce;
  const codeVerifier = req.cookies?.googleOAuthCodeVerifier;
  const nextPath = getSafeNextPath(req.cookies?.googleOAuthNext);

  if (
    req.query.error ||
    !hasMatchingOAuthState(state, storedState) ||
    typeof nonce !== 'string' ||
    typeof codeVerifier !== 'string' ||
    typeof req.query.code !== 'string' ||
    req.query.code.length === 0 ||
    req.query.code.length > 4096
  ) {
    return redirectGoogleAuthError(res);
  }

  clearGoogleOAuthCookies(res);
  res.set('Cache-Control', 'no-store');
  res.set('Referrer-Policy', 'no-referrer');

  try {
    const identity = await verifyGoogleAuthorizationCode({
      code: req.query.code,
      codeVerifier,
      nonce,
    });
    const { user, created } = await resolveGoogleAccount(identity);

    if (created) {
      const pendingInvitations = await prisma.projectInvitation.findMany({
        where: {
          invitedEmail: identity.email,
          status: 'pending',
          expiresAt: { gt: new Date() },
        },
        include: {
          project: { select: { id: true, title: true } },
        },
      });

      for (const invitation of pendingInvitations) {
        await prisma.projectInvitation.update({
          where: { id: invitation.id },
          data: { invitedUserId: user.id },
        });
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: `You have a pending invitation to join "${invitation.project.title}".`,
          },
        });
      }
    }

    const refreshPayload = generateRefreshToken(user);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshPayload.tokenHash,
        expiresAt: refreshPayload.expiresAt,
      },
    });

    setAuthCookies(res, generateAccessToken(user), refreshPayload.token);

    const redirectUrl = new URL('/login', env.CLIENT_URL);
    redirectUrl.searchParams.set('google', 'success');
    if (nextPath) redirectUrl.searchParams.set('next', nextPath);
    return res.redirect(303, redirectUrl.toString());
  } catch (error) {
    logger.error('Google OAuth callback failed', { name: error?.name || 'Error' });
    return redirectGoogleAuthError(res);
  }
};
