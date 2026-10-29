const assert = require('node:assert/strict');
const AppError = require('../../src/utils/AppError');
const ErrorCodes = require('../../src/utils/error-codes');

// Store original NODE_ENV
const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

test('badRequest factory creates 400 error with correct code and message', () => {
  const error = AppError.badRequest(ErrorCodes.BAD_REQUEST, 'Custom bad request');
  assert.equal(error.status, 400);
  assert.equal(error.code, ErrorCodes.BAD_REQUEST);
  assert.equal(error.message, 'Custom bad request');
  assert.equal(error.isOperational, true);
});

test('unauthorized factory creates 401 error with correct code and message', () => {
  const error = AppError.unauthorized(ErrorCodes.AUTH_TOKEN_EXPIRED, 'Token expired');
  assert.equal(error.status, 401);
  assert.equal(error.code, ErrorCodes.AUTH_TOKEN_EXPIRED);
  assert.equal(error.message, 'Token expired');
});

test('forbidden factory creates 403 error with correct code and message', () => {
  const error = AppError.forbidden(ErrorCodes.FORBIDDEN, 'Access denied');
  assert.equal(error.status, 403);
  assert.equal(error.code, ErrorCodes.FORBIDDEN);
  assert.equal(error.message, 'Access denied');
});

test('notFound factory creates 404 error with correct code and message', () => {
  const error = AppError.notFound(ErrorCodes.NOT_FOUND, 'Resource not found');
  assert.equal(error.status, 404);
  assert.equal(error.code, ErrorCodes.NOT_FOUND);
  assert.equal(error.message, 'Resource not found');
});

test('conflict factory creates 409 error with correct code and message', () => {
  const error = AppError.conflict(ErrorCodes.CONFLICT, 'Duplicate entry');
  assert.equal(error.status, 409);
  assert.equal(error.code, ErrorCodes.CONFLICT);
  assert.equal(error.message, 'Duplicate entry');
});

test('validation factory creates 422 error with validation errors', () => {
  const validationErrors = [
    { field: 'email', message: 'Invalid email' },
    { field: 'password', message: 'Too short' },
  ];
  const error = AppError.validation(ErrorCodes.VALIDATION_ERROR, 'Validation failed', validationErrors);
  assert.equal(error.status, 422);
  assert.equal(error.code, ErrorCodes.VALIDATION_ERROR);
  assert.equal(error.message, 'Validation failed');
  assert.deepEqual(error.validationErrors, validationErrors);
});

test('tooManyRequests factory creates 429 error with correct code and message', () => {
  const error = AppError.tooManyRequests(ErrorCodes.RATE_LIMITED, 'Too many requests');
  assert.equal(error.status, 429);
  assert.equal(error.code, ErrorCodes.RATE_LIMITED);
  assert.equal(error.message, 'Too many requests');
});

test('internal factory creates 500 error with correct code and message', () => {
  const error = AppError.internal(ErrorCodes.INTERNAL_ERROR, 'Server error');
  assert.equal(error.status, 500);
  assert.equal(error.code, ErrorCodes.INTERNAL_ERROR);
  assert.equal(error.message, 'Server error');
});

test('serviceUnavailable factory creates 503 error with correct code and message', () => {
  const error = AppError.serviceUnavailable(ErrorCodes.SERVICE_UNAVAILABLE, 'Database down');
  assert.equal(error.status, 503);
  assert.equal(error.code, ErrorCodes.SERVICE_UNAVAILABLE);
  assert.equal(error.message, 'Database down');
});

test('constructor throws TypeError for invalid code in test environment', () => {
  process.env.NODE_ENV = 'test';
  assert.throws(
    () => new AppError('Test message', 400, 'INVALID_CODE_NOT_IN_ERROR_CODES'),
    TypeError,
    /Invalid error code/
  );
});

test('constructor throws TypeError for invalid code in development environment', () => {
  process.env.NODE_ENV = 'development';
  assert.throws(
    () => new AppError('Test message', 400, 'ANOTHER_INVALID_CODE'),
    TypeError,
    /Invalid error code/
  );
});

test('swapped arguments (message, code) throw TypeError in test environment', () => {
  process.env.NODE_ENV = 'test';
  // Passing message where code is expected
  assert.throws(
    () => AppError.badRequest('This is a message', ErrorCodes.BAD_REQUEST),
    TypeError,
    /Invalid error code/
  );
});

test('constructor allows valid codes in production without throwing', () => {
  process.env.NODE_ENV = 'production';
  const error = new AppError('Test message', 400, ErrorCodes.BAD_REQUEST);
  assert.equal(error.code, ErrorCodes.BAD_REQUEST);
});

test('constructor does not validate codes in production', () => {
  process.env.NODE_ENV = 'production';
  // Should not throw even with invalid code
  const error = new AppError('Test message', 400, 'INVALID_CODE');
  assert.equal(error.code, 'INVALID_CODE');
});
