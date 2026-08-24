const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyRefreshToken,
} = require('../utils/token.util');

/**
 * Cookies must be Secure when SameSite=None is used. Keep localhost HTTP
 * development compatible while using cross-site cookies for HTTPS deployments.
 */
const secureCookies =
  process.env.NODE_ENV === 'production' ||
  (process.env.CLIENT_URL || '')
    .split(',')
    .some((origin) => origin.trim().startsWith('https://'));

const authCookieAttributes = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: secureCookies ? 'none' : 'lax',
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

/** Set auth cookies using unified names */
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, cookieOptions(1 / 24)); // 1 hour
  res.cookie('refreshToken', refreshToken, cookieOptions(7));    // 7 days
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google authentication' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      user = await prisma.user.create({
        data: {
          email,
          username: displayName || email.split('@')[0],
          password: hashedPassword,
          avatar: photoURL || null,
          role: 'user',
        },
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
      message: 'Google login successful',
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar ?? null },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const userId = decoded.sub || decoded.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
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
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    let userId = req.user?.userId;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (!userId) userId = decoded.sub || decoded.userId;
      } catch {}
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
    }

    if (userId) {
      await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    }

    clearAllAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    clearAllAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
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

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log(`[MOCK EMAIL] Password reset link for ${user.email}: ${resetLink}`);

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    const tokenHash = hashToken(token);
    const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: tokenRecord.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.update({ where: { tokenHash }, data: { used: true } }),
      prisma.refreshToken.updateMany({ where: { userId: tokenRecord.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};
