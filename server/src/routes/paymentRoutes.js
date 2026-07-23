const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validateRecordPayment } = require('../validators/paymentValidator');
const authMiddleware = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(authMiddleware);

// GET /api/payments - List payments (Admin/Agent sees all, Customer sees own)
router.get('/', paymentController.getAllPayments);

// POST /api/payments - Record a new payment
router.post('/', validateRecordPayment, paymentController.recordPayment);

// GET /api/payments/policy/:policyId - Get payments for a policy
router.get('/policy/:policyId', paymentController.getPaymentsByPolicy);

module.exports = router;
