const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err?.message === 'CORS policy violation: origin not allowed') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  if (err && err.message && err.message.toLowerCase().includes('invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  console.error('Unhandled server error:', err?.message || err);
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
