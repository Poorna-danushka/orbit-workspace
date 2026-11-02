const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const prisma = require('../../src/config/prisma');
const authController = require('../../src/controllers/auth.controller');
const AppError = require('../../src/utils/AppError');
const { generateRefreshToken } = require('../../src/utils/token.util');
const { rotateRefreshToken } = require('../../src/services/refresh-token.service');

jest.mock('../../src/services/refresh-token.service', () => ({
  rotateRefreshToken: jest.fn(),
}));

const makeResponse = () => ({
  cookies: new Map(),
  statusCode: 200,
  body: null,
  cookie(name, value) {
    this.cookies.set(name, value);
    return this;
  },
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

describe('authentication role contracts', () => {
  const originalPrisma = {
    userFindUnique: prisma.user.findUnique,
    userCreate: prisma.user.create,
    invitationFindMany: prisma.projectInvitation.findMany,
    refreshTokenCreate: prisma.refreshToken.create,
    bcryptHash: bcrypt.hash,
    bcryptCompare: bcrypt.compare,
  };

  afterEach(() => {
    prisma.user.findUnique = originalPrisma.userFindUnique;
    prisma.user.create = originalPrisma.userCreate;
    prisma.projectInvitation.findMany = originalPrisma.invitationFindMany;
    prisma.refreshToken.create = originalPrisma.refreshTokenCreate;
    bcrypt.hash = originalPrisma.bcryptHash;
    bcrypt.compare = originalPrisma.bcryptCompare;
    jest.mocked(rotateRefreshToken).mockReset();
  });

  test('registration explicitly creates a lowercase user role', async () => {
    let createdUser;
    prisma.user.findUnique = async () => null;
    prisma.user.create = async ({ data }) => {
      createdUser = { id: 'new-user', avatar: null, ...data };
      return createdUser;
    };
    prisma.projectInvitation.findMany = async () => [];
    prisma.refreshToken.create = async () => ({});
    bcrypt.hash = async () => 'hashed-password';
    const response = makeResponse();

    await authController.register(
      { body: { username: 'Orbit User', email: 'user@example.test', password: 'password' } },
      response,
    );

    assert.equal(createdUser.role, 'user');
    assert.equal(response.statusCode, 201);
    assert.equal(response.body.user.role, 'user');
  });

  test.each(['ADMIN', 'USER', 'Admin', 'User', 'unsupported', null, undefined])(
    'login rejects database role %s without issuing tokens',
    async (role) => {
      prisma.user.findUnique = async () => ({
        id: 'account-id',
        username: 'Orbit User',
        email: 'user@example.test',
        password: 'hashed-password',
        role,
      });
      bcrypt.compare = async () => true;
      prisma.refreshToken.create = jest.fn();

      await assert.rejects(
        authController.login(
          { body: { email: 'user@example.test', password: 'password' } },
          makeResponse(),
        ),
        (error) => error instanceof AppError && error.status === 403 && error.code === 'FORBIDDEN',
      );
      assert.equal(prisma.refreshToken.create.mock.calls.length, 0);
    },
  );

  test('login preserves exact supported lowercase roles in its response', async () => {
    const user = {
      id: 'account-id',
      username: 'Orbit User',
      email: 'user@example.test',
      password: 'hashed-password',
      role: 'user',
    };
    prisma.user.findUnique = async () => user;
    bcrypt.compare = async () => true;
    prisma.refreshToken.create = async () => ({});
    const response = makeResponse();

    await authController.login(
      { body: { email: user.email, password: 'password' } },
      response,
    );

    assert.equal(response.body.user.role, 'user');
  });

  test('refresh rejects unsupported database roles before rotating tokens', async () => {
    const refreshToken = generateRefreshToken({ id: 'account-id', role: 'user' }).token;
    prisma.user.findUnique = async () => ({
      id: 'account-id',
      username: 'Orbit User',
      email: 'user@example.test',
      role: 'USER',
    });

    await assert.rejects(
      authController.refresh({ cookies: { refreshToken } }, makeResponse()),
      (error) => error instanceof AppError && error.status === 403 && error.code === 'FORBIDDEN',
    );
    expect(rotateRefreshToken).not.toHaveBeenCalled();
  });

  test.each(['admin', 'user'])('refresh response preserves exact lowercase role %s', async (role) => {
    const refreshToken = generateRefreshToken({ id: 'account-id', role }).token;
    prisma.user.findUnique = async () => ({
      id: 'account-id',
      username: 'Orbit User',
      email: 'user@example.test',
      role,
    });
    jest.mocked(rotateRefreshToken).mockResolvedValue({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
    });
    const response = makeResponse();

    await authController.refresh({ cookies: { refreshToken } }, response);

    assert.equal(response.body.user.role, role);
  });
});
