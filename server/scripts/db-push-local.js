const { execFileSync } = require('node:child_process');
const { getLocalDatabaseUrl } = require('../src/config/database-url.util');

const databaseUrl = getLocalDatabaseUrl(process.env.LOCAL_DATABASE_URL);
const environment = { ...process.env, DATABASE_URL: databaseUrl };

execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push'], {
  env: environment,
  stdio: 'inherit',
});
