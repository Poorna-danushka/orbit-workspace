const { validateDatabaseUrl } = require('../../src/config/database-url.util');
const testDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.TEST_DATABASE_URL ||
  'mongodb://127.0.0.1:27017/orbit_test?replicaSet=rs0&directConnection=true';

validateDatabaseUrl(testDatabaseUrl, { requireTestDatabase: true });
if (process.env.TEST_DATABASE_URL && process.env.TEST_DATABASE_URL !== testDatabaseUrl) {
  throw new Error('DATABASE_URL must match TEST_DATABASE_URL before tests can run');
}

Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: testDatabaseUrl,
  TEST_DATABASE_URL: testDatabaseUrl,
  JWT_SECRET: 'orbit-test-access-secret-only',
  JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
  CORS_ORIGINS: 'http://localhost:3000',
  CLIENT_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  GOOGLE_CALLBACK_URL: '',
});
