const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

/**
 * Upload a document metadata record after file is saved by Multer.
 * @param {object} params - { customerId, file, currentUser }
 */
const uploadDocument = async ({ customerId, file, currentUser }) => {
  const parsedCustomerId = parseInt(customerId, 10);
  if (isNaN(parsedCustomerId) || parsedCustomerId <= 0) {
    const err = new Error('Invalid customer ID');
    err.statusCode = 400;
    throw err;
  }

  // EC-D07: Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: parsedCustomerId },
  });

  if (!customer) {
    // Clean up uploaded file if customer doesn't exist
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    const err = new Error('Referenced customer does not exist');
    err.statusCode = 400;
    throw err;
  }

  // Customer role ownership check
  if (currentUser && currentUser.role === 'customer' && customer.email !== currentUser.email) {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    const err = new Error('Access denied. You can only upload documents for your own profile.');
    err.statusCode = 403;
    throw err;
  }

  const document = await prisma.document.create({
    data: {
      customerId: parsedCustomerId,
      fileName: file.originalname,
      filePath: file.filename, // Store relative filename inside uploads/
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return document;
};

/**
 * Get all documents for a customer.
 * @param {number|string} customerIdInput
 * @param {object} currentUser
 */
const getDocumentsByCustomer = async (customerIdInput, currentUser) => {
  const customerId = parseInt(customerIdInput, 10);
  if (isNaN(customerId) || customerId <= 0) {
    const err = new Error('Invalid customer ID');
    err.statusCode = 400;
    throw err;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-D10: Customer role access isolation
  if (currentUser && currentUser.role === 'customer' && customer.email !== currentUser.email) {
    const err = new Error('Access denied. You can only view your own documents.');
    err.statusCode = 403;
    throw err;
  }

  const documents = await prisma.document.findMany({
    where: { customerId },
    orderBy: { uploadedAt: 'desc' },
  });

  return { customer, documents };
};

/**
 * Get document record for download verification.
 * @param {number|string} id
 * @param {object} currentUser
 */
const downloadDocument = async (id, currentUser) => {
  const documentId = parseInt(id, 10);
  if (isNaN(documentId) || documentId <= 0) {
    const err = new Error('Invalid document ID');
    err.statusCode = 400;
    throw err;
  }

  // EC-D08: Find document in DB
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { customer: true },
  });

  if (!document) {
    const err = new Error('Document record not found');
    err.statusCode = 404;
    throw err;
  }

  // EC-D10: Check customer ownership
  if (currentUser && currentUser.role === 'customer' && document.customer.email !== currentUser.email) {
    const err = new Error('Access denied. You can only download your own documents.');
    err.statusCode = 403;
    throw err;
  }

  // EC-D09: Resolve full file path and check disk existence
  const absolutePath = path.join(__dirname, '..', '..', 'uploads', document.filePath);

  if (!fs.existsSync(absolutePath)) {
    const err = new Error('File not found on disk');
    err.statusCode = 404;
    throw err;
  }

  return {
    document,
    absolutePath,
  };
};

module.exports = {
  uploadDocument,
  getDocumentsByCustomer,
  downloadDocument,
};
