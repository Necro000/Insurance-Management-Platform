const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const {
  validateSubmitClaim,
  validateUpdateClaimStatus,
} = require('../validators/claimValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All claim routes require authentication
router.use(authMiddleware);

// GET /api/claims - List claims (Admin/Agent sees all, Customer sees own)
router.get('/', claimController.getAllClaims);

// POST /api/claims - Submit a new claim
router.post('/', validateSubmitClaim, claimController.submitClaim);

// GET /api/claims/:id - Get single claim details
router.get('/:id', claimController.getClaimById);

// PATCH /api/claims/:id/status - Approve or reject claim (Admin/Agent ONLY per EC-CL10)
router.patch(
  '/:id/status',
  requireRole('admin', 'agent'),
  validateUpdateClaimStatus,
  claimController.updateClaimStatus
);

module.exports = router;
