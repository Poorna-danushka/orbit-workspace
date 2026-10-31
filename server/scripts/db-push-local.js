const { execFileSync } = require('node:child_process');
const { validateDatabaseUrl } = require('../src/config/database-url.util');

const databaseUrl =
  process.env.LOCAL_DATABASE_URL ||
  'mongodb://localhost:27017/orbit?replicaSet=rs0&directConnection=true';
validateDatabaseUrl(databaseUrl);
const environment = { ...process.env, DATABASE_URL: databaseUrl };

execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push'], {
  env: environment,
  stdio: 'inherit',
});
