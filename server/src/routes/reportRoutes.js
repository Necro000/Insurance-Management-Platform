const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All report routes require authentication and Admin role (EC-R03)
router.use(authMiddleware);
router.use(requireRole('admin'));

// GET /api/reports/dashboard - Aggregated stats for dashboard
router.get('/dashboard', reportController.getDashboardStats);

// GET /api/reports/policies - Policy breakdown report
router.get('/policies', reportController.getPolicyReport);

// GET /api/reports/claims - Claim breakdown report
router.get('/claims', reportController.getClaimReport);

// GET /api/reports/premiums - Premium payments breakdown report
router.get('/premiums', reportController.getPremiumReport);

// GET /api/reports/export/pdf - Download summary PDF report
router.get('/export/pdf', reportController.exportPDF);

module.exports = router;
