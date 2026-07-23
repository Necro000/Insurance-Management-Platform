const policyService = require('../services/policyService');
const { paginated, success, created } = require('../utils/responseHelper');

/**
 * @route GET /api/policies
 * @desc Get all policies (filterable by status/search, paginated)
 * @access Authenticated (Customer sees own policies, Admin/Agent sees all)
 */
const getAllPolicies = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const { policies, meta } = await policyService.getAllPolicies({
      status,
      search,
      page,
      limit,
      currentUser: req.user,
    });
    return paginated(res, policies, meta, 'Policies retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/policies/:id
 * @desc Get single policy details
 * @access Authenticated (Customer sees own policy, Admin/Agent sees any)
 */
const getPolicyById = async (req, res, next) => {
  try {
    const policy = await policyService.getPolicyById(req.params.id, req.user);
    return success(res, policy, 'Policy retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/policies
 * @desc Issue a new policy
 * @access Admin, Agent
 */
const createPolicy = async (req, res, next) => {
  try {
    const policy = await policyService.createPolicy(req.body);
    return created(res, policy, 'Policy created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route PUT /api/policies/:id
 * @desc Update policy details
 * @access Admin, Agent
 */
const updatePolicy = async (req, res, next) => {
  try {
    const updatedPolicy = await policyService.updatePolicy(req.params.id, req.body);
    return success(res, updatedPolicy, 'Policy updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route PATCH /api/policies/:id/renew
 * @desc Renew policy (extends end date by 1 year)
 * @access Admin, Agent
 */
const renewPolicy = async (req, res, next) => {
  try {
    const renewedPolicy = await policyService.renewPolicy(req.params.id);
    return success(res, renewedPolicy, 'Policy renewed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route PATCH /api/policies/:id/cancel
 * @desc Cancel a policy
 * @access Admin only
 */
const cancelPolicy = async (req, res, next) => {
  try {
    const cancelledPolicy = await policyService.cancelPolicy(req.params.id);
    return success(res, cancelledPolicy, 'Policy cancelled successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  renewPolicy,
  cancelPolicy,
};
