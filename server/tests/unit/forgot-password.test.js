const assert = require('node:assert/strict');
const prisma = require('../../src/config/prisma');

// Mock email service before requiring the controller
jest.mock('../../src/services/email.service', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

const { forgotPassword } = require('../../src/controllers/auth.controller');
const { sendPasswordResetEmail } = require('../../src/services/email.service');

const GENERIC_MESSAGE = 'If an account with that email exists, a reset link has been sent.';

test('forgotPassword returns identical response for existing and non-existing emails', async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.passwordResetToken.create;

  try {
    let findUniqueCalled = false;
    let createCalled = false;

    // Test with non-existing email
    prisma.user.findUnique = async () => {
      findUniqueCalled = true;
      return null;
    };

    const nonExistingReq = { body: { email: 'nonexistent@example.com' } };
    let nonExistingStatus = 200;
    let nonExistingBody = null;
    const nonExistingRes = {
      json(body) {
        nonExistingBody = body;
        return this;
      },
      status(code) {
        nonExistingStatus = code;
        return this;
      },
    };

    await forgotPassword(nonExistingReq, nonExistingRes);

    assert.equal(findUniqueCalled, true, 'findUnique should be called');
    assert.equal(nonExistingStatus, 200, 'Status should be 200');
    assert.equal(nonExistingBody.message, GENERIC_MESSAGE);

    // Test with existing email
    findUniqueCalled = false;
    prisma.user.findUnique = async () => {
      findUniqueCalled = true;
      return { id: 'user-123', email: 'existing@example.com' };
    };

    prisma.passwordResetToken.create = async () => {
      createCalled = true;
      return { id: 'token-123' };
    };

    sendPasswordResetEmail.mockResolvedValue(undefined);

    const existingReq = { body: { email: 'existing@example.com' } };
    let existingStatus = 200;
    let existingBody = null;
    const existingRes = {
      json(body) {
        existingBody = body;
        return this;
      },
      status(code) {
        existingStatus = code;
        return this;
      },
    };

    await forgotPassword(existingReq, existingRes);

    assert.equal(findUniqueCalled, true, 'findUnique should be called for existing user');
    assert.equal(createCalled, true, 'Token should be created for existing user');
    assert.equal(sendPasswordResetEmail.mock.calls.length > 0, true, 'Email should be sent for existing user');
    assert.equal(existingStatus, 200, 'Status should be 200');
    assert.equal(existingBody.message, GENERIC_MESSAGE);

    // Verify responses are identical
    assert.deepEqual(nonExistingBody, existingBody, 'Response bodies must be identical');
    assert.equal(nonExistingStatus, existingStatus, 'Response statuses must be identical');
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.passwordResetToken.create = originalCreate;
    sendPasswordResetEmail.mockClear();
  }
});

test('forgotPassword returns identical response even when email sending fails', async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.passwordResetToken.create;

  try {
    prisma.user.findUnique = async () => ({ id: 'user-123', email: 'existing@example.com' });
    prisma.passwordResetToken.create = async () => ({ id: 'token-123' });
    
    // Mock email service to throw error
    sendPasswordResetEmail.mockRejectedValue(new Error('SMTP connection failed'));

    const req = { body: { email: 'existing@example.com' } };
    let status = 200;
    let body = null;
    const res = {
      json(b) {
        body = b;
        return this;
      },
      status(code) {
        status = code;
        return this;
      },
    };

    await forgotPassword(req, res);

    // Should still return success response despite email failure
    assert.equal(status, 200, 'Status should be 200 even on email failure');
    assert.equal(body.message, GENERIC_MESSAGE, 'Should return generic message');
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.passwordResetToken.create = originalCreate;
    sendPasswordResetEmail.mockClear();
  }
});
