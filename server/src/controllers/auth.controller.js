const bcrypt = require('bcrypt');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const prisma = require('../config/prisma');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyRefreshToken,
} = require('../utils/token.util');
const { sendPasswordResetEmail } = require('../services/email.service');
const { rotateRefreshToken } = require('../services/refresh-token.service');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');
const logger = require('../utils/logger.util');
const { clearAllAuthCookies, setAccessCookie, setAuthCookies } = require('../utils/auth-cookies.util');
const { activeRefreshTokenWhere } = require('../utils/refresh-token-query.util');

const sendRefreshResponse = (res, user, accessToken, refreshToken) => {
  if (refreshToken) {
    setAuthCookies(res, accessToken, refreshToken);
  } else {
    setAccessCookie(res, accessToken);
  }

  return res.json({
    message: 'Token refreshed successfully',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
    },
  });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict(ErrorCodes.CONFLICT, 'User already exists');
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
      revokedAt: null,
      replacedBy: null,
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
      revokedAt: null,
      replacedBy: null,
    },
  });

  const accessToken = generateAccessToken(user);
  setAuthCookies(res, accessToken, refreshPayload.token);

  res.json({
    message: 'Login successful',
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar ?? null },
  });
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

  const userId = decoded.sub || decoded.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.unauthorized(ErrorCodes.AUTH_USER_NOT_FOUND, 'User account no longer exists');
  }

  const session = await rotateRefreshToken(user, hashToken(refreshToken));
  return sendRefreshResponse(res, user, session.accessToken, session.refreshToken);
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  let userId = req.user?.userId;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!userId) userId = decoded.sub || decoded.userId;
    } catch (error) {
      if (!(error instanceof JsonWebTokenError)) throw error;
    }
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  if (userId) {
    await prisma.refreshToken.updateMany({
      where: activeRefreshTokenWhere({ userId }),
      data: { revokedAt: new Date() },
    });
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

  try {
    await sendPasswordResetEmail({ to: user.email, resetToken });
  } catch (error) {
    // Log email failure but return success response to prevent email enumeration
    logger.error('Password reset email delivery failed', {
      email: user.email,
      error: error.message,
    });
  }

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
    prisma.refreshToken.updateMany({
      where: activeRefreshTokenWhere({ userId: tokenRecord.userId }),
      data: { revokedAt: new Date() },
    }),
  ]);

  res.json({ message: 'Password reset successfully. You can now log in.' });
};
