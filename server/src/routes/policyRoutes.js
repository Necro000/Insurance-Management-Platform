const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const {
  validateCreatePolicy,
  validateUpdatePolicy,
} = require('../validators/policyValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All policy routes require authentication
router.use(authMiddleware);

// GET /api/policies - List policies (Customer sees own, Admin/Agent sees all)
router.get('/', policyController.getAllPolicies);

// POST /api/policies - Issue a new policy (Admin/Agent)
router.post(
  '/',
  requireRole('admin', 'agent'),
  validateCreatePolicy,
  policyController.createPolicy
);

// GET /api/policies/:id - Get policy details (Customer sees own, Admin/Agent sees any)
router.get('/:id', policyController.getPolicyById);

// PUT /api/policies/:id - Update policy details (Admin/Agent)
router.put(
  '/:id',
  requireRole('admin', 'agent'),
  validateUpdatePolicy,
  policyController.updatePolicy
);

// PATCH /api/policies/:id/renew - Renew policy (Admin/Agent)
router.patch('/:id/renew', requireRole('admin', 'agent'), policyController.renewPolicy);

// PATCH /api/policies/:id/cancel - Cancel policy (Admin ONLY per spec)
router.patch('/:id/cancel', requireRole('admin'), policyController.cancelPolicy);

module.exports = router;
