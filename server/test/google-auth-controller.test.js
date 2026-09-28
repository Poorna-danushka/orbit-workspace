const assert = require('node:assert/strict');
const test = require('node:test');
const authController = require('../src/controllers/auth.controller');
const env = require('../src/config/env');

const createResponse = () => ({
  cookies: new Map(),
  clearedCookies: [],
  headers: {},
  statusCode: 200,
  location: null,
  body: null,
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

test('Google OAuth initiation sets short-lived HttpOnly state/nonce/PKCE cookies', async () => {
  const originalSettings = {
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: env.GOOGLE_CALLBACK_URL,
    GOOGLE_OAUTH_CONFIGURED: env.GOOGLE_OAUTH_CONFIGURED,
  };
  env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
  env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/auth/google/callback';
  env.GOOGLE_OAUTH_CONFIGURED = true;

  try {
    const response = createResponse();
    await authController.startGoogleOAuth({ query: { next: '/projects?filter=mine' } }, response);

    assert.equal(response.statusCode, 302);
    const authorizationUrl = new URL(response.location);
    assert.equal(authorizationUrl.origin, 'https://accounts.google.com');
    assert.equal(authorizationUrl.searchParams.get('response_type'), 'code');
    assert.equal(authorizationUrl.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(authorizationUrl.searchParams.get('code_challenge'));
    assert.ok(authorizationUrl.searchParams.get('state'));
    assert.ok(authorizationUrl.searchParams.get('nonce'));
    assert.deepEqual([...response.cookies.keys()].sort(), [
      'googleOAuthCodeVerifier',
      'googleOAuthNext',
      'googleOAuthNonce',
      'googleOAuthState',
    ]);

    for (const { options } of response.cookies.values()) {
      assert.equal(options.httpOnly, true);
      assert.equal(options.sameSite, 'lax');
      assert.equal(options.path, '/api/auth');
      assert.equal(options.maxAge, 10 * 60 * 1000);
    }
    assert.equal(response.cookies.get('googleOAuthNext').value, '/projects?filter=mine');
  } finally {
    Object.assign(env, originalSettings);
  }
});

test('Google OAuth callback rejects mismatched state and clears transient cookies', async () => {
  const response = createResponse();
  await authController.googleCallback({
    query: {
      state: 'a'.repeat(43),
      code: 'authorization-code',
    },
    cookies: {
      googleOAuthState: 'b'.repeat(43),
      googleOAuthNonce: 'nonce',
      googleOAuthCodeVerifier: 'verifier',
    },
  }, response);

  assert.equal(response.statusCode, 303);
  assert.equal(new URL(response.location).pathname, '/login');
  assert.equal(new URL(response.location).searchParams.get('google'), 'error');
  assert.deepEqual(
    response.clearedCookies.map(({ name }) => name).sort(),
    ['googleOAuthCodeVerifier', 'googleOAuthNext', 'googleOAuthNonce', 'googleOAuthState'],
  );
});
