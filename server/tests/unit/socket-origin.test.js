const assert = require('node:assert/strict');
const env = require('../../src/config/env');
const { isAllowedSocketOrigin } = require('../../src/utils/socket-origin.util');

test('socket origin policy rejects browser origins not explicitly configured', () => {
  assert.equal(isAllowedSocketOrigin('https://unapproved.example.invalid'), false);
  assert.equal(isAllowedSocketOrigin(env.CORS_ORIGINS[0]), true);
  assert.equal(isAllowedSocketOrigin(undefined), true);
});
