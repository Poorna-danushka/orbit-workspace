const assert = require('node:assert/strict');
const test = require('node:test');
const { sanitizeMessageContent } = require('../src/controllers/chat.controller');

test('legacy Cloudinary links are replaced with project-authorized attachment routes', () => {
  const legacyUrl = 'https://res.cloudinary.com/test-cloud/image/upload/v123/orbit/attachments/file.png';
  const attachmentPaths = new Map([[legacyUrl, '/api/uploads/attachment-id/content']]);

  assert.equal(
    sanitizeMessageContent(`📎 file.png\n${legacyUrl}`, attachmentPaths),
    '📎 file.png\n/api/uploads/attachment-id/content',
  );
  assert.equal(
    sanitizeMessageContent(`📎 unknown\n${legacyUrl}`, new Map()),
    '📎 unknown\n[Attachment unavailable]',
  );
});
