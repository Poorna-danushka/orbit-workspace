const startsWithBytes = (buffer, bytes) =>
  buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte);

const hasZipSignature = (buffer) =>
  startsWithBytes(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
  startsWithBytes(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
  startsWithBytes(buffer, [0x50, 0x4b, 0x07, 0x08]);

const isPlainText = (buffer) => {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
  } catch {
    return false;
  }
};

const signatureChecks = {
  'image/jpeg': (buffer) =>
    startsWithBytes(buffer, [0xff, 0xd8, 0xff]),
  'image/png': (buffer) =>
    startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/gif': (buffer) =>
    buffer.length >= 6 &&
    ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6)),
  'image/webp': (buffer) =>
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP',
  'application/pdf': (buffer) =>
    buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-',
  'application/msword': (buffer) =>
    startsWithBytes(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  'application/vnd.ms-excel': (buffer) =>
    startsWithBytes(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': hasZipSignature,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': hasZipSignature,
  'text/plain': isPlainText,
};

const isAllowedFileContent = (mimeType, buffer) =>
  Buffer.isBuffer(buffer) &&
  buffer.length > 0 &&
  Object.prototype.hasOwnProperty.call(signatureChecks, mimeType) &&
  signatureChecks[mimeType](buffer);

module.exports = { isAllowedFileContent };
