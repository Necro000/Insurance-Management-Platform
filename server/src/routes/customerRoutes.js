const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const {
  validateCreateCustomer,
  validateUpdateCustomer,
} = require('../validators/customerValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All customer management routes require authentication and Admin/Agent role
router.use(authMiddleware);
router.use(requireRole('admin', 'agent'));

// GET /api/customers - List all customers with search & pagination
router.get('/', customerController.getAllCustomers);

// POST /api/customers - Register a new customer
router.post('/', validateCreateCustomer, customerController.createCustomer);

// GET /api/customers/:id - Get customer details
router.get('/:id', customerController.getCustomerById);

// PUT /api/customers/:id - Update customer information
router.put('/:id', validateUpdateCustomer, customerController.updateCustomer);

// GET /api/customers/:id/history - Get customer's policy & claim history
router.get('/:id/history', customerController.getCustomerHistory);

module.exports = router;
