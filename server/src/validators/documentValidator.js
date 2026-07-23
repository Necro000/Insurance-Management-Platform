const { z } = require('zod');

const uploadDocumentSchema = z.object({
  customerId: z.number({ required_error: 'Customer ID is required' }).int().positive('Customer ID must be a positive integer'),
});

const validateUploadDocument = (req, res, next) => {
  if (req.body.customerId && typeof req.body.customerId === 'string') {
    req.body.customerId = parseInt(req.body.customerId, 10);
  }

  const result = uploadDocumentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // EC-D04: Check if file was uploaded by Multer
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a valid file (JPEG, PNG, PDF ≤ 5MB).',
    });
  }

  req.body = result.data;
  next();
};

module.exports = {
  uploadDocumentSchema,
  validateUploadDocument,
};
