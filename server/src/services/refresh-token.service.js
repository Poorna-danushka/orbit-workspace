const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../utils/error-codes');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.util');

const REFRESH_REUSE_GRACE_MS = 10_000;

const isWithinRefreshGraceWindow = (tokenRecord, now) => {
  if (!tokenRecord.revokedAt || !tokenRecord.replacedBy) return false;
  const age = now.getTime() - new Date(tokenRecord.revokedAt).getTime();
  return age >= 0 && age <= REFRESH_REUSE_GRACE_MS;
};

const revokeActiveRefreshTokens = (database, userId, revokedAt) =>
  database.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt },
  });

const getGraceSession = async (database, user, tokenRecord, now) => {
  if (!isWithinRefreshGraceWindow(tokenRecord, now)) return null;

  const replacement = await database.refreshToken.findUnique({
    where: { tokenHash: tokenRecord.replacedBy },
  });
  if (
    !replacement ||
    replacement.userId !== user.id ||
    replacement.revokedAt ||
    replacement.expiresAt <= now
  ) {
    return null;
  }

  return { accessToken: generateAccessToken(user) };
};

const rotateRefreshToken = async (
  user,
  tokenHash,
  database = prisma,
  clock = () => new Date(),
) => {
  const tokenRecord = await database.refreshToken.findUnique({ where: { tokenHash } });
  const now = clock();

  if (!tokenRecord || tokenRecord.userId !== user.id) {
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid or expired refresh token');
  }

  if (tokenRecord.revokedAt) {
    const graceSession = await getGraceSession(database, user, tokenRecord, now);
    if (graceSession) return graceSession;
    if (tokenRecord.replacedBy) await revokeActiveRefreshTokens(database, user.id, now);
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid or expired refresh token');
  }

  if (tokenRecord.expiresAt <= now) {
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid or expired refresh token');
  }

  const nextRefresh = generateRefreshToken(user);
  let rotated = false;
  try {
    rotated = await database.$transaction(async (transaction) => {
      const result = await transaction.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: now, replacedBy: nextRefresh.tokenHash },
      });
      if (result.count !== 1) return false;

      await transaction.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: nextRefresh.tokenHash,
          expiresAt: nextRefresh.expiresAt,
        },
      });
      return true;
    });
  } catch (error) {
    if (error?.code !== 'P2034') throw error;
  }

  if (!rotated) {
    const updatedTokenRecord = await database.refreshToken.findUnique({ where: { tokenHash } });
    const failureTime = clock();
    const graceSession = updatedTokenRecord
      ? await getGraceSession(database, user, updatedTokenRecord, failureTime)
      : null;
    if (graceSession) return graceSession;

    if (updatedTokenRecord?.replacedBy) {
      await revokeActiveRefreshTokens(database, user.id, failureTime);
    }
    throw AppError.unauthorized(ErrorCodes.AUTH_REFRESH_INVALID, 'Invalid or expired refresh token');
  }

  return {
    accessToken: generateAccessToken(user),
    refreshToken: nextRefresh.token,
  };
};

module.exports = { rotateRefreshToken };
