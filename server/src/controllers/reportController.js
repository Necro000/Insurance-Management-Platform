const reportService = require('../services/reportService');
const { success } = require('../utils/responseHelper');

/**
 * @route GET /api/reports/dashboard
 * @desc Get aggregated dashboard statistics
 * @access Admin only
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    return success(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/reports/policies
 * @desc Get policy report breakdown
 * @access Admin only
 */
const getPolicyReport = async (req, res, next) => {
  try {
    const report = await reportService.getPolicyReport();
    return success(res, report, 'Policy report retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/reports/claims
 * @desc Get claim report breakdown
 * @access Admin only
 */
const getClaimReport = async (req, res, next) => {
  try {
    const report = await reportService.getClaimReport();
    return success(res, report, 'Claim report retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/reports/premiums
 * @desc Get premium payments report breakdown
 * @access Admin only
 */
const getPremiumReport = async (req, res, next) => {
  try {
    const report = await reportService.getPremiumReport();
    return success(res, report, 'Premium report retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/reports/export/pdf
 * @desc Export PDF report document
 * @access Admin only
 */
const exportPDF = async (req, res, next) => {
  try {
    const pdfBuffer = await reportService.exportPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="insurance_summary_report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getPolicyReport,
  getClaimReport,
  getPremiumReport,
  exportPDF,
};
