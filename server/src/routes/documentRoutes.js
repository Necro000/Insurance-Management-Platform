const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');
const { validateUploadDocument } = require('../validators/documentValidator');
const authMiddleware = require('../middleware/authMiddleware');

// All document routes require authentication
router.use(authMiddleware);

// POST /api/documents/upload - Upload a file (multipart/form-data)
router.post(
  '/upload',
  upload.single('file'),
  handleUploadError,
  validateUploadDocument,
  documentController.uploadDocument
);

// GET /api/documents/customer/:customerId - List customer documents
router.get('/customer/:customerId', documentController.getDocumentsByCustomer);

// GET /api/documents/:id/download - Download document file
router.get('/:id/download', documentController.downloadDocument);

module.exports = router;
