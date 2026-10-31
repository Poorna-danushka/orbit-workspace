const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath, override: false });

if (result.error && result.error.code !== 'ENOENT') {
  throw new Error(`Failed to load environment variables from ${envPath}: ${result.error.message}`);
}

const requiredVariables = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV',
  'CORS_ORIGINS',
  'CLIENT_URL',
];

const missing = requiredVariables.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const NODE_ENV = process.env.NODE_ENV;
if (!['development', 'test', 'production'].includes(NODE_ENV)) {
  throw new Error('NODE_ENV must be development, test, or production');
}

const parseDuration = (value, name) => {
  const match = /^([1-9]\d*)(ms|s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error(`${name} must be a positive duration such as 15m or 7d`);
  }
  const units = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const milliseconds = Number(match[1]) * units[match[2]];
  if (!Number.isSafeInteger(milliseconds)) {
    throw new Error(`${name} is too large`);
  }
  return milliseconds;
};

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL?.trim() || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL?.trim() || '7d';
const ACCESS_TOKEN_TTL_MS = parseDuration(ACCESS_TOKEN_TTL, 'ACCESS_TOKEN_TTL');
const REFRESH_TOKEN_TTL_MS = parseDuration(REFRESH_TOKEN_TTL, 'REFRESH_TOKEN_TTL');

if (NODE_ENV === 'test') {
  let testDatabaseUrl;
  try {
    testDatabaseUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('NODE_ENV=test requires DATABASE_URL to target the dedicated orbit_test database');
  }
  const testDatabaseName = decodeURIComponent(testDatabaseUrl.pathname.slice(1).split('/')[0] || '');
  if (
    !['mongodb:', 'mongodb+srv:'].includes(testDatabaseUrl.protocol) ||
    testDatabaseName !== 'orbit_test'
  ) {
    throw new Error('NODE_ENV=test requires DATABASE_URL to target the dedicated orbit_test database');
  }

  const configuredTestDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();
  if (configuredTestDatabaseUrl) {
    if (configuredTestDatabaseUrl !== process.env.DATABASE_URL) {
      throw new Error('In test mode, DATABASE_URL must match TEST_DATABASE_URL');
    }
  } else if (!['localhost', '127.0.0.1', '::1'].includes(testDatabaseUrl.hostname)) {
    throw new Error('Remote test databases require an explicit TEST_DATABASE_URL');
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL?.trim();
const googleOAuthValues = [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL];
const googleOAuthConfigured = googleOAuthValues.every(Boolean);

if (googleOAuthValues.some(Boolean) && !googleOAuthConfigured) {
  throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must be configured together');
}

if (NODE_ENV === 'production' && !googleOAuthConfigured) {
  throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL are required in production');
}

if (googleOAuthConfigured) {
  let callbackUrl;
  try {
    callbackUrl = new URL(GOOGLE_CALLBACK_URL);
  } catch {
    throw new Error('GOOGLE_CALLBACK_URL must be a valid absolute URL');
  }

  if (
    callbackUrl.pathname !== '/api/auth/google/callback' ||
    callbackUrl.username ||
    callbackUrl.password ||
    callbackUrl.search ||
    callbackUrl.hash ||
    (NODE_ENV === 'production' && callbackUrl.protocol !== 'https:') ||
    (NODE_ENV !== 'production' &&
      callbackUrl.protocol !== 'https:' &&
      !(callbackUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(callbackUrl.hostname)))
  ) {
    throw new Error('GOOGLE_CALLBACK_URL must use the /api/auth/google/callback path and a secure allowed origin');
  }
}

const parseOrigin = (value, name) => {
  const candidate = value.trim().replace(/\/$/, '');
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`${name} must contain valid origin URLs`);
  }
  if (
    candidate === '*' ||
    parsed.origin !== candidate ||
    (NODE_ENV === 'production' && parsed.protocol !== 'https:')
  ) {
    throw new Error(`${name} must contain exact${NODE_ENV === 'production' ? ' HTTPS' : ''} origins without paths or wildcards`);
  }
  return parsed.origin;
};

const CORS_ORIGINS = process.env.CORS_ORIGINS
  .split(',')
  .map((origin) => parseOrigin(origin, 'CORS_ORIGINS'));
const CLIENT_URL = parseOrigin(process.env.CLIENT_URL, 'CLIENT_URL');

const cookieSecureValue = process.env.COOKIE_SECURE?.trim().toLowerCase();
if (cookieSecureValue && !['true', 'false'].includes(cookieSecureValue)) {
  throw new Error('COOKIE_SECURE must be either true or false');
}
const COOKIE_SECURE = cookieSecureValue
  ? cookieSecureValue === 'true'
  : NODE_ENV === 'production' || CLIENT_URL.startsWith('https://');

const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE?.trim().toLowerCase() ||
  (COOKIE_SECURE ? 'none' : 'lax');
if (!['strict', 'lax', 'none'].includes(COOKIE_SAME_SITE)) {
  throw new Error('COOKIE_SAME_SITE must be strict, lax, or none');
}
if (COOKIE_SAME_SITE === 'none' && !COOKIE_SECURE) {
  throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true');
}

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN?.trim() || undefined;
if (COOKIE_DOMAIN && (!/^[.]?[A-Za-z0-9.-]+$/.test(COOKIE_DOMAIN) || COOKIE_DOMAIN.includes('..'))) {
  throw new Error('COOKIE_DOMAIN must be a valid cookie domain');
}

const REFRESH_REUSE_GRACE_SECONDS = Number(process.env.REFRESH_REUSE_GRACE_SECONDS || 10);
if (!Number.isSafeInteger(REFRESH_REUSE_GRACE_SECONDS) || REFRESH_REUSE_GRACE_SECONDS < 1) {
  throw new Error('REFRESH_REUSE_GRACE_SECONDS must be a positive integer');
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error('SMTP_PORT must be an integer between 1 and 65535');
}
const smtpSecureValue = String(process.env.SMTP_SECURE || 'false').toLowerCase();
if (!['true', 'false'].includes(smtpSecureValue)) {
  throw new Error('SMTP_SECURE must be either true or false');
}

if (
  NODE_ENV === 'production' &&
  (process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_REFRESH_SECRET.length < 32 ||
    process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET)
) {
  throw new Error('Production JWT secrets must be distinct and at least 32 characters long');
}

if (NODE_ENV === 'production') {
  const productionRequirements = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];
  const missingProductionSettings = productionRequirements.filter((name) => !process.env[name]);
  if (missingProductionSettings.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingProductionSettings.join(', ')}`);
  }
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS,
  REFRESH_REUSE_GRACE_SECONDS,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  NODE_ENV,
  CORS_ORIGINS,
  CLIENT_URL,
  COOKIE_SECURE,
  COOKIE_SAME_SITE,
  COOKIE_DOMAIN,
  PORT: port,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: smtpPort,
  SMTP_SECURE: smtpSecureValue === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM || process.env.SMTP_USER,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GOOGLE_OAUTH_CONFIGURED: googleOAuthConfigured,
};
