const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { validateDatabaseUrl } = require('../../src/config/database-url.util');

test.each([
  'mongodb://localhost:27017/orbit_test',
  'mongodb://127.0.0.1:27017/orbit_test',
  'mongodb://mongo:27017/orbit_test',
])('accepts local test database URL %s', (databaseUrl) => {
  expect(validateDatabaseUrl(databaseUrl, { requireTestDatabase: true }).protocol).toBe('mongodb:');
});

test.each([
  'mongodb+srv://cluster.example.test/orbit_test',
  'mongodb://database.example.test:27017/orbit_test',
  'mongodb://localhost:27017/orbit',
])('rejects unsafe test database URL %s', (databaseUrl) => {
  expect(() => validateDatabaseUrl(databaseUrl, { requireTestDatabase: true })).toThrow(
    'DATABASE_URL must target a local MongoDB database ending in _test',
  );
});

test('local database push refuses a remote target', () => {
  const result = spawnSync(
    process.execPath,
    [path.resolve(__dirname, '../../scripts/db-push-local.js')],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        LOCAL_DATABASE_URL: 'mongodb+srv://cluster.example.test/orbit',
      },
    },
  );

  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('DATABASE_URL must target a local MongoDB host and database');
});
