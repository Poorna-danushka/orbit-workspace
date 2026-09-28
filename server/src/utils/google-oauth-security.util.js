const crypto = require('node:crypto');
const env = require('../config/env');

const getSafeNextPath = (candidate) => {
  if (
    typeof candidate !== 'string' ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    /[\u0000-\u001f]/.test(candidate)
  ) {
    return '';
  }

  try {
    const resolved = new URL(candidate, env.CLIENT_URL);
    return resolved.origin === env.CLIENT_URL
      ? `${resolved.pathname}${resolved.search}${resolved.hash}`
      : '';
  } catch {
    return '';
  }
};

const hasMatchingOAuthState = (provided, stored) => {
  if (
    typeof provided !== 'string' ||
    typeof stored !== 'string' ||
    provided.length < 32 ||
    provided.length > 128 ||
    stored.length < 32 ||
    stored.length > 128
  ) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const storedBuffer = Buffer.from(stored);
  return providedBuffer.length === storedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, storedBuffer);
};

module.exports = { getSafeNextPath, hasMatchingOAuthState };
