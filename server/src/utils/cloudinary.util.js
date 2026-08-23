const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder (e.g. 'orbit/attachments', 'orbit/avatars')
 * @param {string} resourceType - 'auto', 'image', 'raw'
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = 'orbit/attachments', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { uploadBufferToCloudinary };
