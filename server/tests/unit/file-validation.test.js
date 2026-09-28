const assert = require('node:assert/strict');
const { isAllowedFileContent } = require('../../src/utils/file-validation.util');

test('accepts content matching the declared file type', () => {
  assert.equal(
    isAllowedFileContent('image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    true,
  );
  assert.equal(isAllowedFileContent('text/plain', Buffer.from('Orbit notes', 'utf8')), true);
});

test('rejects spoofed, binary-as-text, and empty file content', () => {
  assert.equal(isAllowedFileContent('image/png', Buffer.from('<script>alert(1)</script>')), false);
  assert.equal(isAllowedFileContent('text/plain', Buffer.from([0x00, 0xff])), false);
  assert.equal(isAllowedFileContent('application/pdf', Buffer.alloc(0)), false);
});

test('rejects unknown content types, including inherited object property names', () => {
  assert.equal(isAllowedFileContent('application/octet-stream', Buffer.from('data')), false);
  assert.equal(isAllowedFileContent('toString', Buffer.from('data')), false);
});
