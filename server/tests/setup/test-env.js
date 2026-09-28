const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'mongodb://127.0.0.1:27017/orbit_test';
let parsedDatabaseUrl;

try {
  parsedDatabaseUrl = new URL(testDatabaseUrl);
} catch {
  throw new Error('TEST_DATABASE_URL must be a valid MongoDB URL for the orbit_test database');
}

const databaseName = decodeURIComponent(parsedDatabaseUrl.pathname.slice(1).split('/')[0] || '');
if (!['mongodb:', 'mongodb+srv:'].includes(parsedDatabaseUrl.protocol) || databaseName !== 'orbit_test') {
  throw new Error('TEST_DATABASE_URL must target the dedicated orbit_test database');
}

Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: testDatabaseUrl,
  JWT_SECRET: 'orbit-test-access-secret-only',
  JWT_REFRESH_SECRET: 'orbit-test-refresh-secret-only',
  CORS_ORIGINS: 'http://localhost:3000',
  CLIENT_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  GOOGLE_CALLBACK_URL: '',
});
