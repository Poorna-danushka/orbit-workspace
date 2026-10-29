const assert = require('node:assert/strict');
const AppError = require('../../src/utils/AppError');
const ErrorCodes = require('../../src/utils/error-codes');
const { rotateRefreshToken } = require('../../src/services/refresh-token.service');
const { hashToken } = require('../../src/utils/token.util');

const createDatabase = (records) => {
  const state = new Map(records.map((record) => [record.tokenHash, { ...record }]));
  const updateMany = async ({ where, data }) => {
    let count = 0;
    for (const record of state.values()) {
      const matchesToken = !where.tokenHash || record.tokenHash === where.tokenHash;
      const matchesUser = !where.userId || record.userId === where.userId;
      const matchesRevoked = !Object.hasOwn(where, 'revokedAt') || record.revokedAt === where.revokedAt;
      if (matchesToken && matchesUser && matchesRevoked) {
        Object.assign(record, data);
        count += 1;
      }
    }
    return { count };
  };
  const refreshToken = {
    findUnique: async ({ where }) => {
      const record = state.get(where.tokenHash);
      return record ? { ...record } : null;
    },
    updateMany,
    create: async ({ data }) => {
      state.set(data.tokenHash, { ...data, revokedAt: null, replacedBy: null });
      return data;
    },
  };

  return {
    state,
    refreshToken,
    $transaction: (operation) => operation({ refreshToken }),
  };
};

const user = { id: 'user-id', role: 'user', username: 'user', email: 'user@example.com' };
const activeToken = {
  tokenHash: 'old-token-hash',
  userId: user.id,
  expiresAt: new Date('2030-01-01T00:00:00.000Z'),
  revokedAt: null,
  replacedBy: null,
};

test('refresh reuse inside the grace window returns access without rotating again', async () => {
  const now = new Date();
  const database = createDatabase([activeToken]);
  const firstSession = await rotateRefreshToken(user, activeToken.tokenHash, database, () => now);
  const rotatedRecord = database.state.get(activeToken.tokenHash);

  assert.ok(firstSession.refreshToken);
  assert.equal(rotatedRecord.replacedBy, hashToken(firstSession.refreshToken));

  const concurrentSession = await rotateRefreshToken(
    user,
    activeToken.tokenHash,
    database,
    () => now,
  );

  assert.equal(concurrentSession.refreshToken, undefined);
  assert.equal(
    [...database.state.values()].filter((record) => !record.revokedAt).length,
    1,
  );
});

test('refresh reuse outside the grace window revokes active refresh tokens', async () => {
  const now = new Date('2029-01-01T00:00:11.000Z');
  const database = createDatabase([
    {
      ...activeToken,
      revokedAt: new Date('2029-01-01T00:00:00.000Z'),
      replacedBy: 'replacement-token-hash',
    },
    {
      tokenHash: 'replacement-token-hash',
      userId: user.id,
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      revokedAt: null,
      replacedBy: null,
    },
  ]);

  await assert.rejects(
    rotateRefreshToken(user, activeToken.tokenHash, database, () => now),
    (error) => error instanceof AppError && error.code === ErrorCodes.AUTH_REFRESH_INVALID,
  );
  assert.equal(database.state.get('replacement-token-hash').revokedAt, now);
});
