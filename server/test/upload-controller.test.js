const assert = require('node:assert/strict');
const { Writable } = require('node:stream');
const test = require('node:test');
const cloudinary = require('../src/config/cloudinary');
const prisma = require('../src/config/prisma');
const { getAttachmentContent } = require('../src/controllers/upload.controller');

const createResponse = () => {
  const response = new Writable({
    write(chunk, _encoding, callback) {
      response.body += chunk.toString();
      callback();
    },
  });
  response.body = '';
  response.headers = {};
  response.statusCode = 200;
  response.setHeader = (name, value) => { response.headers[name.toLowerCase()] = value; };
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  return response;
};

test('project attachments are denied before requesting Cloudinary for non-members', async () => {
  const originalAttachmentFindUnique = prisma.attachment.findUnique;
  const originalProjectFindFirst = prisma.project.findFirst;
  const originalFetch = global.fetch;
  let fetchCalled = false;

  try {
    prisma.attachment.findUnique = async () => ({
      id: 'attachment-id',
      projectId: 'project-id',
      taskId: null,
      fileUrl: 'https://res.cloudinary.com/test/image/upload/legacy.png',
      fileName: 'legacy.png',
      mimeType: 'image/png',
      cloudinaryPublicId: 'private/asset',
      cloudinaryResourceType: 'image',
      cloudinaryFormat: 'png',
    });
    prisma.project.findFirst = async () => null;
    global.fetch = async () => {
      fetchCalled = true;
      throw new Error('must not contact the provider');
    };

    const response = createResponse();
    await getAttachmentContent({
      params: { id: 'attachment-id' },
      user: { userId: 'not-a-member' },
    }, response);

    assert.equal(response.statusCode, 403);
    assert.equal(fetchCalled, false);
  } finally {
    prisma.attachment.findUnique = originalAttachmentFindUnique;
    prisma.project.findFirst = originalProjectFindFirst;
    global.fetch = originalFetch;
  }
});

test('authorized attachment content is streamed without exposing a Cloudinary URL', async () => {
  const originalAttachmentFindUnique = prisma.attachment.findUnique;
  const originalProjectFindFirst = prisma.project.findFirst;
  const originalPrivateDownloadUrl = cloudinary.utils.private_download_url;
  const originalFetch = global.fetch;

  try {
    prisma.attachment.findUnique = async () => ({
      id: 'attachment-id',
      projectId: 'project-id',
      taskId: null,
      fileUrl: 'https://res.cloudinary.com/test/image/upload/legacy.png',
      fileName: 'image.png',
      mimeType: 'image/png',
      cloudinaryPublicId: 'private/asset',
      cloudinaryResourceType: 'image',
      cloudinaryFormat: 'png',
    });
    prisma.project.findFirst = async () => ({ id: 'project-id' });
    cloudinary.utils.private_download_url = () => 'https://api.cloudinary.com/private-download';
    global.fetch = async (url) => {
      assert.equal(url.href, 'https://api.cloudinary.com/private-download');
      return new Response(Buffer.from('private image'), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    };

    const response = createResponse();
    await getAttachmentContent({
      params: { id: 'attachment-id' },
      user: { userId: 'project-member' },
    }, response);

    assert.equal(response.body, 'private image');
    assert.equal(response.headers['cache-control'], 'private, no-store');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.match(response.headers['content-disposition'], /^inline;/);
  } finally {
    prisma.attachment.findUnique = originalAttachmentFindUnique;
    prisma.project.findFirst = originalProjectFindFirst;
    cloudinary.utils.private_download_url = originalPrivateDownloadUrl;
    global.fetch = originalFetch;
  }
});
