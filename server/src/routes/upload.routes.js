const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { validateMongoIdParam } = require('../middlewares/mongo-id.middleware');

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(Object.assign(new Error('Invalid file type. Allowed: images, PDF, Word, Excel, TXT.'), { status: 400 }));
    }
    cb(null, true);
  },
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many uploads. Please try again later.' },
});

router.use(verifyToken);
router.param('id', validateMongoIdParam('attachment id'));
router.param('taskId', validateMongoIdParam('task id'));
router.param('projectId', validateMongoIdParam('project id'));
router.get('/:id/content', uploadController.getAttachmentContent);

// Task attachments
router.post('/task/:taskId', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadController.uploadFile);
router.get('/task/:taskId', uploadController.getAttachments);

// Project attachments
router.post('/project/:projectId', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadController.uploadFile);
router.get('/project/:projectId', uploadController.getAttachments);

router.delete('/:id', uploadController.deleteAttachment);

module.exports = router;
