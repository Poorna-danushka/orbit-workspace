const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const prisma = require('../../src/config/prisma');
const { verifyToken } = require('../../src/middlewares/auth.middleware');
const { verifyAdmin } = require('../../src/middlewares/admin.middleware');
const userRoutes = require('../../src/routes/user.routes');
const adminRoutes = require('../../src/routes/admin.routes');
const errorHandler = require('../../src/middlewares/error.middleware');
const { generateAccessToken } = require('../../src/utils/token.util');

const userRecord = (role) => ({
  id: '507f1f77bcf86cd799439011',
  username: 'test-user',
  email: 'test@example.com',
  role,
});

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use(errorHandler);

describe('role authorization middleware', () => {
  const originalFindUnique = prisma.user.findUnique;

  afterEach(() => {
    prisma.user.findUnique = originalFindUnique;
  });

  test.each(['admin', 'user'])('accepts a database role of %s', async (role) => {
    prisma.user.findUnique = async () => userRecord(role);
    const req = {
      cookies: { accessToken: generateAccessToken({ id: 'account-id', role: 'spoofed' }) },
      body: { role: 'spoofed' },
    };
    let capturedError;
    let nextCalled = false;

    await verifyToken(req, {}, (error) => {
      capturedError = error;
      nextCalled = !error;
    });

    assert.equal(capturedError, undefined);
    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, { userId: userRecord(role).id, role });
  });

  test.each(['unknown', '', undefined, null, 'Admin'])(
    'rejects unsupported database role %s',
    async (role) => {
      prisma.user.findUnique = async () => userRecord(role);
      let capturedError;

      await verifyToken(
        { cookies: { accessToken: generateAccessToken({ id: 'account-id', role: 'user' }) } },
        {},
        (error) => {
          capturedError = error;
        },
      );

      assert.equal(capturedError.status, 403);
      assert.equal(capturedError.code, 'FORBIDDEN');
    },
  );

  test('rejects deleted accounts using the existing unauthorized response', async () => {
    prisma.user.findUnique = async () => null;
    let capturedError;

    await verifyToken(
      { cookies: { accessToken: generateAccessToken({ id: 'account-id', role: 'user' }) } },
      {},
      (error) => {
        capturedError = error;
      },
    );

    assert.equal(capturedError.status, 401);
    assert.equal(capturedError.code, 'AUTH_USER_NOT_FOUND');
  });

  test.each(['invalid-token', 'expired'])('rejects %s access tokens', async (tokenType) => {
    const token =
      tokenType === 'invalid-token'
        ? tokenType
        : jwt.sign(
            { sub: 'account-id' },
            'orbit-test-access-secret-only',
            { expiresIn: -1 },
          );
    let lookupCalled = false;
    prisma.user.findUnique = async () => {
      lookupCalled = true;
      return userRecord('user');
    };
    let capturedError;

    await verifyToken({ cookies: { accessToken: token } }, {}, (error) => {
      capturedError = error;
    });

    assert.equal(lookupCalled, false);
    assert.ok(capturedError);
  });

  test('maps database lookup failures to service unavailable', async () => {
    prisma.user.findUnique = async () => {
      const error = new Error('database unavailable');
      error.name = 'PrismaClientInitializationError';
      throw error;
    };
    let capturedError;

    await verifyToken(
      { cookies: { accessToken: generateAccessToken({ id: 'account-id', role: 'user' }) } },
      {},
      (error) => {
        capturedError = error;
      },
    );

    assert.equal(capturedError.status, 503);
    assert.equal(capturedError.code, 'SERVICE_UNAVAILABLE');
  });
});

describe('role-protected routes', () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalFindMany = prisma.user.findMany;
  const originalUpdate = prisma.user.update;
  const originalCount = prisma.user.count;

  afterEach(() => {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.findMany = originalFindMany;
    prisma.user.update = originalUpdate;
    prisma.user.count = originalCount;
  });

  const withRole = (agent, role) =>
    agent.set(
      'Cookie',
      `accessToken=${encodeURIComponent(generateAccessToken({ id: 'account-id', role }))}`,
    );

  test('only an admin database role can use admin APIs', async () => {
    prisma.user.findUnique = async () => userRecord('user');
    const userResponse = await withRole(request(app).get('/admin/users'), 'user');
    expect(userResponse.status).toBe(403);
    expect(userResponse.body.code).toBe('FORBIDDEN');

    prisma.user.findUnique = async () => userRecord('unknown');
    const unknownResponse = await withRole(request(app).get('/admin/users'), 'unknown');
    expect(unknownResponse.status).toBe(403);
    expect(unknownResponse.body.code).toBe('FORBIDDEN');

    prisma.user.findUnique = async () => userRecord('admin');
    prisma.user.findMany = async () => [];
    const adminResponse = await withRole(request(app).get('/admin/users'), 'admin');
    expect(adminResponse.status).toBe(200);
  });

  test.each(['admin', 'user'])('%s accounts retain access to shared user routes', async (role) => {
    prisma.user.findUnique = async () => userRecord(role);
    const response = await withRole(request(app).get('/user/me'), role);
    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe(role);
  });

  test('unsupported database roles cannot use normal protected routes', async () => {
    prisma.user.findUnique = async () => userRecord('unknown');
    const response = await withRole(request(app).get('/user/me'), 'unknown');
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  test('a client-supplied role cannot elevate the database role', async () => {
    prisma.user.findUnique = async () => userRecord('user');
    const response = await withRole(request(app).get('/admin/users'), 'admin');
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  test('ordinary profile updates cannot change the user role', async () => {
    prisma.user.findUnique = async () => userRecord('user');
    prisma.user.update = jest.fn(async ({ data }) => ({ ...userRecord('user'), ...data }));

    const response = await withRole(request(app).patch('/user/profile'), 'user')
      .send({ username: 'updated-user', role: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('user');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { username: 'updated-user' } }),
    );
  });

  test.each(['ADMIN', 'USER', 'Admin', 'User', 'unknown', '', null])(
    'admin role updates reject non-lowercase role %s',
    async (role) => {
      prisma.user.findUnique = async () => userRecord('admin');
      prisma.user.update = jest.fn();

      const response = await withRole(
        request(app).patch('/admin/users/507f1f77bcf86cd799439012/role'),
        'admin',
      ).send({ role });

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(prisma.user.update).not.toHaveBeenCalled();
    },
  );

  test.each(['admin', 'user'])('admin role update accepts exact lowercase %s', async (role) => {
    prisma.user.findUnique = async () => userRecord('admin');
    prisma.user.update = jest.fn(async ({ data }) => ({
      ...userRecord(data.role),
      id: '507f1f77bcf86cd799439012',
    }));
    prisma.user.count = async () => 2;

    const response = await withRole(
      request(app).patch('/admin/users/507f1f77bcf86cd799439012/role'),
      'admin',
    ).send({ role });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe(role);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role } }),
    );
  });
});

test('admin middleware continues to require the exact admin database role', async () => {
  const originalFindUnique = prisma.user.findUnique;

  try {
    prisma.user.findUnique = async () => userRecord('unknown');
    let capturedError;

    await verifyAdmin(
      { cookies: { accessToken: generateAccessToken({ id: 'account-id', role: 'admin' }) } },
      {},
      (error) => {
        capturedError = error;
      },
    );

    assert.equal(capturedError.status, 403);
    assert.equal(capturedError.code, 'FORBIDDEN');
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});
