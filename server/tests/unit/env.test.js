const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const validEnvironment = {
  DATABASE_URL: 'mongodb://localhost:27017/orbit',
  TEST_DATABASE_URL: 'mongodb://127.0.0.1:27017/orbit_test',
  JWT_SECRET: 'access-secret-for-tests-with-more-than-32-characters',
  JWT_REFRESH_SECRET: 'refresh-secret-for-tests-with-more-than-32-characters',
  CORS_ORIGINS: 'https://app.example.test',
  CLIENT_URL: 'https://app.example.test',
  NODE_ENV: 'production',
  SMTP_HOST: 'smtp.example.test',
  SMTP_USER: 'orbit@example.test',
  SMTP_PASS: 'test-password',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-secret',
  GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_CALLBACK_URL: 'https://api.example.test/api/auth/google/callback',
};

const loadSettings = (overrides = {}) => spawnSync(
  process.execPath,
  ['-e', 'const env = require("./src/config/env"); process.stdout.write(JSON.stringify({ origins: env.CORS_ORIGINS, client: env.CLIENT_URL, secure: env.COOKIE_SECURE, googleOAuth: env.GOOGLE_OAUTH_CONFIGURED }));'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, ...validEnvironment, ...overrides },
  },
);

test('production accepts explicitly configured HTTPS origins and complete Google OIDC settings', () => {
  const result = loadSettings();
  assert.equal(result.status, 0, result.stderr);
  const output = result.stdout.trim().split(/\r?\n/).at(-1);
  assert.deepEqual(JSON.parse(output), {
    origins: ['https://app.example.test'],
    client: 'https://app.example.test',
    secure: true,
    googleOAuth: true,
  });
});

test('production requires all Google OIDC settings and rejects insecure callback URLs', () => {
  const missing = loadSettings({ GOOGLE_CLIENT_SECRET: '' });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /GOOGLE_CLIENT_ID/);

  const insecure = loadSettings({
    GOOGLE_CALLBACK_URL: 'http://api.example.test/api/auth/google/callback',
  });
  assert.notEqual(insecure.status, 0);
  assert.match(insecure.stderr, /GOOGLE_CALLBACK_URL/);
});

test('development rejects partial Google OIDC configuration', () => {
  const result = loadSettings({
    NODE_ENV: 'development',
    CORS_ORIGINS: 'http://localhost:3000',
    CLIENT_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must be configured together/);
});

test('development permits only the explicitly configured local HTTP origins', () => {
  const result = loadSettings({
    NODE_ENV: 'development',
    CORS_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
    CLIENT_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  assert.equal(result.status, 0, result.stderr);
  const output = result.stdout.trim().split(/\r?\n/).at(-1);
  assert.deepEqual(JSON.parse(output), {
    origins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    client: 'http://localhost:3000',
    secure: false,
    googleOAuth: false,
  });
});

test('test mode accepts only the dedicated orbit_test database', () => {
  const wrongDatabase = loadSettings({
    NODE_ENV: 'test',
    DATABASE_URL: 'mongodb://127.0.0.1:27017/orbit',
    CORS_ORIGINS: 'http://localhost:3000',
    CLIENT_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  assert.notEqual(wrongDatabase.status, 0);
  assert.match(wrongDatabase.stderr, /orbit_test database/);

  const testDatabase = loadSettings({
    NODE_ENV: 'test',
    DATABASE_URL: 'mongodb://127.0.0.1:27017/orbit_test',
    TEST_DATABASE_URL: 'mongodb://127.0.0.1:27017/orbit_test',
    CORS_ORIGINS: 'http://localhost:3000',
    CLIENT_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  assert.equal(testDatabase.status, 0, testDatabase.stderr);

  const remoteWithoutExplicitTestUrl = loadSettings({
    NODE_ENV: 'test',
    DATABASE_URL: 'mongodb+srv://cluster.example.test/orbit_test',
    TEST_DATABASE_URL: '',
    CORS_ORIGINS: 'http://localhost:3000',
    CLIENT_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
    GOOGLE_CALLBACK_URL: '',
  });
  assert.notEqual(remoteWithoutExplicitTestUrl.status, 0);
  assert.match(remoteWithoutExplicitTestUrl.stderr, /explicit TEST_DATABASE_URL/);
});

test('production refuses to infer CORS origins from CLIENT_URL', () => {
  const result = loadSettings({ CORS_ORIGINS: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CORS_ORIGINS/);
});

test('production refuses wildcard or insecure CORS origins', () => {
  const wildcard = loadSettings({ CORS_ORIGINS: '*' });
  assert.notEqual(wildcard.status, 0);
  assert.match(wildcard.stderr, /CORS_ORIGINS/);

  const insecure = loadSettings({
    CORS_ORIGINS: 'http://app.example.test',
    CLIENT_URL: 'http://app.example.test',
  });
  assert.notEqual(insecure.status, 0);
  assert.match(insecure.stderr, /HTTPS/);
});
