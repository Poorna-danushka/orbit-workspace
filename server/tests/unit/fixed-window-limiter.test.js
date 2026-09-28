const assert = require('node:assert/strict');
const { createFixedWindowLimiter } = require('../../src/utils/fixed-window-limiter.util');

test('fixed-window limiter applies per-key limits and resets at the window boundary', () => {
  let currentTime = 1_000;
  const limiter = createFixedWindowLimiter({
    limit: 2,
    windowMs: 60_000,
    now: () => currentTime,
  });

  assert.equal(limiter.allow('user-a'), true);
  assert.equal(limiter.allow('user-a'), true);
  assert.equal(limiter.allow('user-a'), false);
  assert.equal(limiter.allow('user-b'), true);

  currentTime += 60_000;
  assert.equal(limiter.allow('user-a'), true);
});
