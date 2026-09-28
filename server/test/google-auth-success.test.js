const assert = require('node:assert/strict');
const test = require('node:test');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../src/config/prisma');
const env = require('../src/config/env');
const authController = require('../src/controllers/auth.controller');

const createResponse = () => ({
  cookies: new Map(),
  clearedCookies: [],
  headers: {},
  statusCode: 200,
  location: null,
  cookie(name, value, options) {
    this.cookies.set(name, { value, options });
    return this;
  },
  clearCookie(name, options) {
    this.clearedCookies.push({ name, options });
    return this;
  },
  set(name, value) {
    this.headers[name.toLowerCase()] = value;
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
  redirect(statusCode, location) {
    this.statusCode = statusCode;
    this.location = location;
    return this;
  },
});

test('verified Google OIDC callback creates the existing Orbit HttpOnly session', async () => {
  const originalSettings = {
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: env.GOOGLE_CALLBACK_URL,
    GOOGLE_OAUTH_CONFIGURED: env.GOOGLE_OAUTH_CONFIGURED,
  };
  const originalGoogleMethods = {
    getToken: OAuth2Client.prototype.getToken,
    verifyIdToken: OAuth2Client.prototype.verifyIdToken,
  };
  const originalPrismaMethods = {
    findUnique: prisma.user.findUnique,
    create: prisma.user.create,
    refreshTokenCreate: prisma.refreshToken.create,
    invitationFindMany: prisma.projectInvitation.findMany,
  };

  env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
  env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/auth/google/callback';
  env.GOOGLE_OAUTH_CONFIGURED = true;

  const user = {
    id: 'orbit-user-id',
    username: 'Google User',
    email: 'google@example.test',
    role: 'user',
    avatar: 'https://example.test/avatar.png',
    password: 'hashed-random-password',
  };

  try {
    OAuth2Client.prototype.getToken = async (options) => {
      assert.equal(options.code, 'one-time-code');
      assert.equal(options.codeVerifier, 'stored-pkce-verifier');
      return { tokens: { id_token: 'verified-id-token' } };
    };
    OAuth2Client.prototype.verifyIdToken = async (options) => {
      assert.equal(options.idToken, 'verified-id-token');
      assert.equal(options.audience, 'test-client-id.apps.googleusercontent.com');
      return {
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          sub: 'stable-google-subject',
          email: 'Google@Example.test',
          email_verified: true,
          nonce: 'one-time-nonce',
          name: 'Google User',
          picture: 'https://example.test/avatar.png',
        }),
      };
    };
    prisma.user.findUnique = async () => null;
    prisma.user.create = async ({ data }) => {
      assert.equal(data.googleId, 'stable-google-subject');
      assert.equal(data.email, 'google@example.test');
      assert.equal(data.role, undefined);
      return user;
    };
    prisma.refreshToken.create = async ({ data }) => {
      assert.equal(data.userId, user.id);
      assert.ok(data.tokenHash);
    };
    prisma.projectInvitation.findMany = async () => [];

    const response = createResponse();
    await authController.googleCallback({
      query: { state: 's'.repeat(43), code: 'one-time-code' },
      cookies: {
        googleOAuthState: 's'.repeat(43),
        googleOAuthNonce: 'one-time-nonce',
        googleOAuthCodeVerifier: 'stored-pkce-verifier',
        googleOAuthNext: '/projects',
      },
    }, response);

    assert.equal(response.statusCode, 303);
    const redirect = new URL(response.location);
    assert.equal(redirect.pathname, '/login');
    assert.equal(redirect.searchParams.get('google'), 'success');
    assert.equal(redirect.searchParams.get('next'), '/projects');
    assert.ok(response.cookies.has('accessToken'));
    assert.ok(response.cookies.has('refreshToken'));
    assert.equal(response.cookies.get('accessToken').options.httpOnly, true);
    assert.equal(response.cookies.get('refreshToken').options.httpOnly, true);
    assert.ok(!response.cookies.has('googleIdToken'));
  } finally {
    Object.assign(env, originalSettings);
    OAuth2Client.prototype.getToken = originalGoogleMethods.getToken;
    OAuth2Client.prototype.verifyIdToken = originalGoogleMethods.verifyIdToken;
    prisma.user.findUnique = originalPrismaMethods.findUnique;
    prisma.user.create = originalPrismaMethods.create;
    prisma.refreshToken.create = originalPrismaMethods.refreshTokenCreate;
    prisma.projectInvitation.findMany = originalPrismaMethods.invitationFindMany;
  }
});
