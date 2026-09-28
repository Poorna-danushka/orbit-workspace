const assert = require('node:assert/strict');
const test = require('node:test');
const {
  getSafeNextPath,
  hasMatchingOAuthState,
} = require('../src/utils/google-oauth-security.util');

test('Google OAuth state comparison requires a strong matching value', () => {
  const state = 'a'.repeat(43);
  assert.equal(hasMatchingOAuthState(state, state), true);
  assert.equal(hasMatchingOAuthState(state, `${state}b`), false);
  assert.equal(hasMatchingOAuthState('short', 'short'), false);
  assert.equal(hasMatchingOAuthState(['invalid'], state), false);
});

test('Google OAuth post-login path only accepts same-origin relative paths', () => {
  assert.equal(getSafeNextPath('/projects?filter=mine'), '/projects?filter=mine');
  assert.equal(getSafeNextPath('//attacker.example.test'), '');
  assert.equal(getSafeNextPath('https://attacker.example.test/path'), '');
  assert.equal(getSafeNextPath('/\\attacker.example.test'), '');
  assert.equal(getSafeNextPath('/login\nLocation: https://attacker.example.test'), '');
});
