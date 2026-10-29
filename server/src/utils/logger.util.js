const SAFE_LOG_FIELDS = new Set([
  'code',
  'name',
  'port',
  'requestId',
  'status',
  'statusCode',
]);

const getSafeDetails = (details) => {
  if (!details || typeof details !== 'object') return undefined;

  const source = details instanceof Error
    ? {
        name: details.name,
        code: details.code,
        status: details.status,
        statusCode: details.statusCode,
        requestId: details.requestId,
      }
    : details;
  const safeDetails = Object.fromEntries(
    Object.entries(source).filter(([key, value]) =>
      SAFE_LOG_FIELDS.has(key) &&
      (typeof value === 'string' || typeof value === 'number'),
    ),
  );

  return Object.keys(safeDetails).length > 0 ? safeDetails : undefined;
};

const writeLog = (level, event, details) => {
  console[level](`[orbit] ${event}`, getSafeDetails(details) || '');
};

module.exports = {
  error: (event, details) => writeLog('error', event, details),
  info: (event, details) => writeLog('log', event, details),
  warn: (event, details) => writeLog('warn', event, details),
};
