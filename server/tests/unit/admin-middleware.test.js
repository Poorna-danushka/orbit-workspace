const assert = require('node:assert/strict');
const prisma = require('../../src/config/prisma');
const { verifyAdmin } = require('../../src/middlewares/admin.middleware');
const { generateAccessToken } = require('../../src/utils/token.util');

test('admin authentication distinguishes invalid tokens from account-service outages', async () => {
  const originalFindUnique = prisma.user.findUnique;

  try {
    let lookupCalled = false;
    prisma.user.findUnique = async () => {
      lookupCalled = true;
      const error = new Error('database unavailable');
      error.name = 'PrismaClientInitializationError';
      throw error;
    };

    let capturedError = null;
    await verifyAdmin(
      {
        cookies: { accessToken: generateAccessToken({ id: 'admin-id', role: 'admin' }) },
      },
      {}, // response object (not used when next() is called)
      (error) => {
        capturedError = error;
      }
    );

    assert.ok(lookupCalled, 'Database lookup should have been attempted');
    assert.ok(capturedError, 'Error should be passed to next()');
    assert.equal(capturedError.status, 503);
    assert.equal(capturedError.code, 'SERVICE_UNAVAILABLE');

    // Test invalid token (JWT error)
    lookupCalled = false;
    capturedError = null;

    await verifyAdmin(
      {
        cookies: { accessToken: 'invalid-token' },
      },
      {},
      (error) => {
        capturedError = error;
      }
    );

    assert.ok(!lookupCalled, 'Database lookup should not happen for invalid token');
    assert.ok(capturedError, 'JWT error should be passed to next()');
    assert.equal(capturedError.name, 'JsonWebTokenError');
  } finally {
    prisma.user.findUnique = originalFindUnique;
  }
});


