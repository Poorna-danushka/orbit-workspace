const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { TokenExpiredError } = require('jsonwebtoken');
const prisma = require('../config/prisma');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyRefreshToken,
} = require('../utils/token.util');
const { sendPasswordResetEmail } = require('../services/email.service');
const {
  createGoogleAuthorizationRequest,
  verifyGoogleAuthorizationCode,
} = require('../services/google-oauth.service');
const { resolveGoogleAccount } = require('../services/google-account.service');
const { getSafeNextPath, hasMatchingOAuthState } = require('../utils/google-oauth-security.util');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');
const env = require('../config/env');

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

/**
 * Cookies must be Secure when SameSite=None is used. Keep localhost HTTP
 * development compatible while using cross-site cookies for HTTPS deployments.
 */
const authCookieAttributes = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
  path: '/',
};

/** Shared cookie option factory */
const cookieOptions = (days) => ({
  ...authCookieAttributes,
  maxAge: days * 24 * 60 * 60 * 1000,
});

/** Clear all auth cookies */
const clearAllAuthCookies = (res) => {
  const opts = { ...authCookieAttributes };

  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
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

/** Set auth cookies using unified names */
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, cookieOptions(1 / 24)); // 1 hour
  res.cookie('refreshToken', refreshToken, cookieOptions(7));    // 7 days
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict('User already exists', ErrorCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  const pendingInvitations = await prisma.projectInvitation.findMany({
    where: {
      invitedEmail: email.toLowerCase(),
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

  const refreshPayload = generateRefreshToken(user);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshPayload.tokenHash,
      expiresAt: refreshPayload.expiresAt,
    },
  });

  const accessToken = generateAccessToken(user);
  setAuthCookies(res, accessToken, refreshPayload.token);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar ?? null },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw AppError.badRequest(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw AppError.badRequest(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid credentials');
  }

  const refreshPayload = generateRefreshToken(user);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshPayload.tokenHash,
      expiresAt: refreshPayload.expiresAt,
    },
  });

  const accessToken = generateAccessToken(user);
  setAuthCookies(res, accessToken, refreshPayload.token);

  res.json({
    message: 'Login successful',
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar ?? null },
  });
};

exports.startGoogleOAuth = async (req, res) => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    throw AppError.serviceUnavailable('Google sign-in is not configured', ErrorCodes.SERVICE_UNAVAILABLE);
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

    const accessToken = generateAccessToken(user);
    setAuthCookies(res, accessToken, refreshPayload.token);

    const redirectUrl = new URL('/login', env.CLIENT_URL);
    redirectUrl.searchParams.set('google', 'success');
    if (nextPath) redirectUrl.searchParams.set('next', nextPath);
    return res.redirect(303, redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth callback failed:', error?.name || 'Error');
    return redirectGoogleAuthError(res);
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_MISSING, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    // Distinguish expired from invalid/malformed
    if (error instanceof TokenExpiredError) {
      throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_EXPIRED, 'Refresh token has expired');
    }
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid or expired refresh token');
  }

  const userId = decoded.sub || decoded.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.unauthorized(ErrorCodes.AUTH_USER_NOT_FOUND, 'User account no longer exists');
  }

  const nextRefresh = generateRefreshToken(user);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date(), replacedBy: nextRefresh.tokenHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: nextRefresh.tokenHash,
        expiresAt: nextRefresh.expiresAt,
      },
    }),
  ]);

  const nextAccessToken = generateAccessToken(user);
  setAuthCookies(res, nextAccessToken, nextRefresh.token);

  res.json({
    message: 'Token refreshed successfully',
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar ?? null },
  });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  let userId = req.user?.userId;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!userId) userId = decoded.sub || decoded.userId;
    } catch {
      // Ignore verification errors during logout
    }
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  if (userId) {
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  clearAllAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  }

  const resetToken = generatePasswordResetToken();
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({ to: user.email, resetToken });

  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token) {
    throw AppError.badRequest(ErrorCodes.VALIDATION_ERROR, 'Reset token is required');
  }

  const tokenHash = hashToken(token);
  const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
    throw AppError.badRequest(ErrorCodes.AUTH_RESET_TOKEN_INVALID, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: tokenRecord.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.update({ where: { tokenHash }, data: { used: true } }),
    prisma.refreshToken.updateMany({ where: { userId: tokenRecord.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);

  res.json({ message: 'Password reset successfully. You can now log in.' });
};
