const assert = require('node:assert/strict');
const test = require('node:test');
const cloudinary = require('../src/config/cloudinary');
const {
  uploadBufferToCloudinary,
  createPrivateDownloadUrl,
  deleteCloudinaryAsset,
} = require('../src/utils/cloudinary.util');

test('Cloudinary attachment operations use the supported SDK signatures and authenticated delivery', async () => {
  const originalUploadStream = cloudinary.uploader.upload_stream;
  const originalPrivateDownloadUrl = cloudinary.utils.private_download_url;
  const originalDestroy = cloudinary.uploader.destroy;

  try {
    let uploadOptions;
    cloudinary.uploader.upload_stream = (callback, options) => {
      uploadOptions = options;
      return {
        end(buffer) {
          assert.deepEqual(buffer, Buffer.from('test attachment'));
          callback(null, { public_id: 'orbit/attachments/test', resource_type: 'raw' });
        },
      };
    };

    const uploaded = await uploadBufferToCloudinary(
      Buffer.from('test attachment'),
      'orbit/attachments',
      'auto',
      { type: 'authenticated' },
    );
    assert.equal(uploaded.public_id, 'orbit/attachments/test');
    assert.deepEqual(uploadOptions, {
      folder: 'orbit/attachments',
      resource_type: 'auto',
      type: 'authenticated',
    });

    let downloadOptions;
    cloudinary.utils.private_download_url = (publicId, format, options) => {
      downloadOptions = { publicId, format, ...options };
      return 'https://api.cloudinary.com/private-download';
    };
    const before = Math.floor(Date.now() / 1000);
    assert.equal(createPrivateDownloadUrl({
      publicId: 'orbit/attachments/test',
      resourceType: 'raw',
      format: 'pdf',
    }), 'https://api.cloudinary.com/private-download');
    assert.equal(downloadOptions.publicId, 'orbit/attachments/test');
    assert.equal(downloadOptions.resource_type, 'raw');
    assert.equal(downloadOptions.type, 'authenticated');
    assert.equal(downloadOptions.format, 'pdf');
    assert.ok(downloadOptions.expires_at >= before + 60);
    assert.ok(downloadOptions.expires_at <= before + 61);

    let deletionOptions;
    cloudinary.uploader.destroy = async (publicId, options) => {
      deletionOptions = { publicId, ...options };
      return { result: 'ok' };
    };
    await deleteCloudinaryAsset({
      publicId: 'orbit/attachments/test',
      resourceType: 'raw',
    });
    assert.equal(deletionOptions.type, 'authenticated');
    assert.equal(deletionOptions.invalidate, true);
  } finally {
    cloudinary.uploader.upload_stream = originalUploadStream;
    cloudinary.utils.private_download_url = originalPrivateDownloadUrl;
    cloudinary.uploader.destroy = originalDestroy;
  }
});
