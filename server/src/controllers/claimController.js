const claimService = require('../services/claimService');
const { paginated, success, created } = require('../utils/responseHelper');

/**
 * @route GET /api/claims
 * @desc Get all claims (filterable by status/search, paginated)
 * @access Authenticated (Customer sees own, Admin/Agent sees all)
 */
const getAllClaims = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const { claims, meta } = await claimService.getAllClaims({
      status,
      search,
      page,
      limit,
      currentUser: req.user,
    });
    return paginated(res, claims, meta, 'Claims retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/claims/:id
 * @desc Get single claim details
 * @access Authenticated
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await claimService.getClaimById(req.params.id, req.user);
    return success(res, claim, 'Claim retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/claims
 * @desc Submit a new claim
 * @access Authenticated
 */
const submitClaim = async (req, res, next) => {
  try {
    const claim = await claimService.submitClaim(req.body, req.user);
    return created(res, claim, 'Claim submitted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route PATCH /api/claims/:id/status
 * @desc Approve or reject a claim
 * @access Admin, Agent
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const claim = await claimService.updateClaimStatus(req.params.id, status);
    return success(res, claim, `Claim ${status} successfully`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClaims,
  getClaimById,
  submitClaim,
  updateClaimStatus,
};
