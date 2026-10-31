const mockDatabase = {
  records: new Map(),
  user: {
    id: '012345678901234567890123',
    role: 'user',
    username: 'test-user',
    email: 'test@example.test',
    avatar: null,
  },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(async () => mockDatabase.user),
  },
  refreshToken: {
    findUnique: jest.fn(async ({ where }) => mockDatabase.records.get(where.tokenHash) || null),
    updateMany: jest.fn(async ({ where, data }) => {
      let count = 0;
      for (const record of mockDatabase.records.values()) {
        if (
          (!where.tokenHash || record.tokenHash === where.tokenHash) &&
          (!where.userId || record.userId === where.userId) &&
          (!Object.hasOwn(where, 'revokedAt') || record.revokedAt === where.revokedAt)
        ) {
          Object.assign(record, data);
          count += 1;
        }
      }
      return { count };
    }),
    create: jest.fn(async ({ data }) => {
      const record = { ...data, revokedAt: null, replacedBy: null };
      mockDatabase.records.set(record.tokenHash, record);
      return record;
    }),
  },
};
mockPrisma.$transaction = jest.fn((callback) => callback(mockPrisma));

jest.mock('../../src/config/prisma', () => mockPrisma);

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { JWT_REFRESH_SECRET, REFRESH_TOKEN_TTL_MS } = require('../../src/config/env');
const { generateRefreshToken, hashToken } = require('../../src/utils/token.util');

const makeRequest = (token) => {
  const call = request(app).post('/api/auth/refresh');
  return token ? call.set('Cookie', `refreshToken=${token}`) : call;
};

const addRefreshToken = () => {
  const payload = generateRefreshToken(mockDatabase.user);
  mockDatabase.records.set(payload.tokenHash, {
    tokenHash: payload.tokenHash,
    userId: mockDatabase.user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    revokedAt: null,
    replacedBy: null,
  });
  return payload.token;
};

beforeEach(() => {
  mockDatabase.records.clear();
  mockDatabase.user = {
    id: '012345678901234567890123',
    role: 'user',
    username: 'test-user',
    email: 'test@example.test',
    avatar: null,
  };
  jest.clearAllMocks();
});

test('concurrent refresh requests using one cookie both succeed with a single rotation', async () => {
  const refreshToken = addRefreshToken();
  const responses = await Promise.all([
    makeRequest(refreshToken),
    makeRequest(refreshToken),
  ]);

  expect(responses.map((response) => response.status)).toEqual([200, 200]);
  expect(responses.map((response) => response.body.message)).toEqual([
    'Token refreshed successfully',
    'Token refreshed successfully',
  ]);
  const rotatedCookies = responses
    .flatMap((response) => response.headers['set-cookie'] || [])
    .filter((cookie) => cookie.startsWith('refreshToken='));
  expect(rotatedCookies).toHaveLength(1);
  expect([...mockDatabase.records.values()].filter((record) => !record.revokedAt)).toHaveLength(1);
});

test('reusing a rotated refresh token after the grace window revokes active tokens', async () => {
  const reusedToken = addRefreshToken();
  const reusedHash = hashToken(reusedToken);
  const first = await makeRequest(reusedToken);
  expect(first.status).toBe(200);

  const oldRecord = mockDatabase.records.get(reusedHash);
  oldRecord.revokedAt = new Date(Date.now() - 11_000);
  const replay = await makeRequest(reusedToken);

  expect(replay.status).toBe(401);
  expect(replay.body.code).toBe('AUTH_REFRESH_INVALID');
  expect([...mockDatabase.records.values()].every((record) => record.revokedAt)).toBe(true);
});

test('reusing a refresh token revoked by logout is invalid', async () => {
  const refreshToken = addRefreshToken();
  const csrf = await request(app).get('/api/csrf-token');
  const logout = await request(app)
    .post('/api/auth/logout')
    .set('Cookie', `refreshToken=${refreshToken}; csrfToken=${csrf.body.csrfToken}`)
    .set('X-CSRF-Token', csrf.body.csrfToken);

  expect(logout.status).toBe(200);
  expect(mockDatabase.records.get(hashToken(refreshToken)).revokedAt).toBeInstanceOf(Date);

  const response = await makeRequest(refreshToken);

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_REFRESH_INVALID');
});

test('expired refresh JWT returns AUTH_REFRESH_EXPIRED', async () => {
  const expiredToken = jwt.sign(
    { sub: mockDatabase.user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '-1s', algorithm: 'HS256' },
  );

  const response = await makeRequest(expiredToken);

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_REFRESH_EXPIRED');
});

test('missing refresh cookie returns AUTH_REFRESH_MISSING', async () => {
  const response = await makeRequest();

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_REFRESH_MISSING');
});

test('deleted user returns AUTH_USER_NOT_FOUND for a valid refresh JWT', async () => {
  const refreshToken = addRefreshToken();
  mockDatabase.user = null;

  const response = await makeRequest(refreshToken);

  expect(response.status).toBe(401);
  expect(response.body.code).toBe('AUTH_USER_NOT_FOUND');
});
