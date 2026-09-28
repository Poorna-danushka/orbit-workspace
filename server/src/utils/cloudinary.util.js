const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder (e.g. 'orbit/attachments', 'orbit/avatars')
 * @param {string} resourceType - 'auto', 'image', 'video', or 'raw'
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = 'orbit/attachments', resourceType = 'auto', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
      { folder, resource_type: resourceType, ...options },
    );
    uploadStream.end(buffer);
  });
};

const createPrivateDownloadUrl = ({ publicId, resourceType, format }) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60;
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: 'authenticated',
    expires_at: expiresAt,
  });
};

const deleteCloudinaryAsset = ({ publicId, resourceType, type = 'authenticated' }) => (
  cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type,
    invalidate: true,
  }).then((result) => {
    if (!['ok', 'not found'].includes(result?.result)) {
      throw new Error('Cloudinary asset deletion failed');
    }
    return result;
  })
);

module.exports = { uploadBufferToCloudinary, createPrivateDownloadUrl, deleteCloudinaryAsset };
