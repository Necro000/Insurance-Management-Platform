const documentService = require('../services/documentService');
const { created, success } = require('../utils/responseHelper');

/**
 * @route POST /api/documents/upload
 * @desc Upload a document (multipart/form-data)
 * @access Authenticated
 */
const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentService.uploadDocument({
      customerId: req.body.customerId,
      file: req.file,
      currentUser: req.user,
    });
    return created(res, document, 'Document uploaded successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/documents/customer/:customerId
 * @desc List all documents for a customer
 * @access Authenticated
 */
const getDocumentsByCustomer = async (req, res, next) => {
  try {
    const result = await documentService.getDocumentsByCustomer(
      req.params.customerId,
      req.user
    );
    return success(res, result, 'Customer documents retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/documents/:id/download
 * @desc Download a document file stream
 * @access Authenticated
 */
const downloadDocument = async (req, res, next) => {
  try {
    const { document, absolutePath } = await documentService.downloadDocument(
      req.params.id,
      req.user
    );
    return res.download(absolutePath, document.fileName);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByCustomer,
  downloadDocument,
};
