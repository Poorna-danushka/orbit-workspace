const assert = require('node:assert/strict');
const errorHandler = require('../../src/middlewares/error.middleware');

test('reports rejected CORS origins as a forbidden response', () => {
  let statusCode;
  let responseBody;
  const response = {
    headersSent: false,
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  errorHandler(new Error('CORS policy violation: origin not allowed'), {}, response, () => {});

  assert.equal(statusCode, 403);
  assert.deepEqual(responseBody, { message: 'Origin not allowed' });
});
