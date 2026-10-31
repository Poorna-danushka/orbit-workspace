const LOCAL_DATABASE_HOSTS = new Set(['localhost', '127.0.0.1', 'mongo']);

const validateDatabaseUrl = (databaseUrl, { requireTestDatabase = false } = {}) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid local MongoDB URL');
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1).split('/')[0] || '');
  if (
    parsedUrl.protocol !== 'mongodb:' ||
    !LOCAL_DATABASE_HOSTS.has(parsedUrl.hostname) ||
    !databaseName ||
    (requireTestDatabase && !databaseName.endsWith('_test'))
  ) {
    throw new Error(
      requireTestDatabase
        ? 'DATABASE_URL must target a local MongoDB database ending in _test'
        : 'DATABASE_URL must target a local MongoDB host and database',
    );
  }

  return parsedUrl;
};

module.exports = { validateDatabaseUrl };
