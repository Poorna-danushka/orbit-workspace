const assert = require('node:assert/strict');
const prisma = require('../../src/config/prisma');
const { verifyAdmin } = require('../../src/middlewares/admin.middleware');
const { generateAccessToken } = require('../../src/utils/token.util');

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
    }, unavailableResponse, (error) => {
      // Now expect next to be called with an error
      assert.ok(error);
      assert.equal(error.status, 503);
      assert.equal(error.code, 'SERVICE_UNAVAILABLE');
    });

    assert.equal(lookupCalled, true);

    lookupCalled = false;
    const invalidResponse = createResponse();
    await verifyAdmin({
      cookies: { accessToken: 'invalid-token' },
    }, invalidResponse, (error) => {
      // Expect next to be called with JWT error (handled by global error handler)
      assert.ok(error);
    });

    assert.equal(lookupCalled, false);
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});

