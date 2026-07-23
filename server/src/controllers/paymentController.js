const paymentService = require('../services/paymentService');
const { paginated, success, created } = require('../utils/responseHelper');

/**
 * @route GET /api/payments
 * @desc Get all premium payments
 * @access Admin, Agent (Customer sees own payments)
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const { payments, meta } = await paymentService.getAllPayments({
      status,
      page,
      limit,
      currentUser: req.user,
    });
    return paginated(res, payments, meta, 'Payments retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/payments/policy/:policyId
 * @desc Get payment history for a specific policy
 * @access Authenticated
 */
const getPaymentsByPolicy = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentsByPolicy(req.params.policyId, req.user);
    return success(res, result, 'Policy payments retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/payments
 * @desc Record a new premium payment
 * @access Authenticated
 */
const recordPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.recordPayment(req.body);
    return created(res, payment, 'Payment recorded successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayments,
  getPaymentsByPolicy,
  recordPayment,
};
