const assert = require('node:assert/strict');
const test = require('node:test');
const env = require('../src/config/env');
const {
  createGoogleAuthorizationRequest,
  verifyGoogleAuthorizationCode,
} = require('../src/services/google-oauth.service');

test('Google authorization uses OIDC, state, nonce, and PKCE S256', async () => {
  let authorizationOptions;
  const client = {
    async generateCodeVerifierAsync() {
      return { codeVerifier: 'verifier-secret', codeChallenge: 'challenge-value' };
    },
    generateAuthUrl(options) {
      authorizationOptions = options;
      return 'https://accounts.google.com/o/oauth2/v2/auth';
    },
  };

  const result = await createGoogleAuthorizationRequest({
    state: 'random-state',
    nonce: 'random-nonce',
  }, client);

  assert.equal(result.authorizationUrl, 'https://accounts.google.com/o/oauth2/v2/auth');
  assert.equal(result.codeVerifier, 'verifier-secret');
  assert.equal(authorizationOptions.response_type, 'code');
  assert.deepEqual(authorizationOptions.scope, ['openid', 'email', 'profile']);
  assert.equal(authorizationOptions.state, 'random-state');
  assert.equal(authorizationOptions.nonce, 'random-nonce');
  assert.equal(authorizationOptions.code_challenge, 'challenge-value');
  assert.equal(authorizationOptions.code_challenge_method, 'S256');
});

test('Google code verification checks audience, issuer, nonce, and verified email', async () => {
  const payload = {
    iss: 'https://accounts.google.com',
    sub: 'google-subject',
    email: 'User@Example.test',
    email_verified: true,
    nonce: 'expected-nonce',
    name: 'Orbit User',
    picture: 'https://example.test/avatar.png',
  };
  let exchangeOptions;
  let verifyOptions;
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalConfigured = env.GOOGLE_OAUTH_CONFIGURED;
  env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
  env.GOOGLE_OAUTH_CONFIGURED = true;
  const client = {
    async getToken(options) {
      exchangeOptions = options;
      return { tokens: { id_token: 'verified-google-id-token' } };
    },
    async verifyIdToken(options) {
      verifyOptions = options;
      return { getPayload: () => payload };
    },
  };

  try {
    const identity = await verifyGoogleAuthorizationCode({
      code: 'authorization-code',
      codeVerifier: 'stored-pkce-verifier',
      nonce: 'expected-nonce',
    }, client);

    assert.deepEqual(exchangeOptions, {
      code: 'authorization-code',
      codeVerifier: 'stored-pkce-verifier',
    });
    assert.equal(verifyOptions.audience, 'test-client-id.apps.googleusercontent.com');
    assert.equal(identity.sub, 'google-subject');
    assert.equal(identity.email, 'user@example.test');
    assert.equal(identity.emailVerified, true);
    assert.equal(identity.name, 'Orbit User');
    assert.equal(identity.picture, 'https://example.test/avatar.png');

    for (const changes of [
      { iss: 'https://attacker.example.test' },
      { nonce: 'wrong-nonce' },
      { email_verified: false },
      { sub: '' },
    ]) {
      Object.assign(payload, changes);
      await assert.rejects(
        verifyGoogleAuthorizationCode({
          code: 'authorization-code',
          codeVerifier: 'stored-pkce-verifier',
          nonce: 'expected-nonce',
        }, client),
        /could not be verified/,
      );
      Object.assign(payload, {
        iss: 'https://accounts.google.com',
        sub: 'google-subject',
        email_verified: true,
        nonce: 'expected-nonce',
      });
    }
  } finally {
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_OAUTH_CONFIGURED = originalConfigured;
  }
});
