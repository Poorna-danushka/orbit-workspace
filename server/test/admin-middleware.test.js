const assert = require('node:assert/strict');
const test = require('node:test');
const prisma = require('../src/config/prisma');
const { verifyAdmin } = require('../src/middlewares/admin.middleware');
const { generateAccessToken } = require('../src/utils/token.util');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('admin authentication distinguishes invalid tokens from account-service outages', async () => {
  const originalFindUnique = prisma.user.findUnique;

  try {
    let lookupCalled = false;
    prisma.user.findUnique = async () => {
      lookupCalled = true;
      throw new Error('database unavailable');
    };
    const unavailableResponse = createResponse();
    await verifyAdmin({
      cookies: { accessToken: generateAccessToken({ id: 'admin-id', role: 'admin' }) },
    }, unavailableResponse, () => assert.fail('next must not be called on database failure'));

    assert.equal(unavailableResponse.statusCode, 503);
    assert.equal(lookupCalled, true);

    lookupCalled = false;
    const invalidResponse = createResponse();
    await verifyAdmin({
      cookies: { accessToken: 'invalid-token' },
    }, invalidResponse, () => assert.fail('next must not be called for an invalid token'));

    assert.equal(invalidResponse.statusCode, 401);
    assert.equal(lookupCalled, false);
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});
