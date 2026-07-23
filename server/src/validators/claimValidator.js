const { z } = require('zod');

const submitClaimSchema = z.object({
  policyId: z.number({ required_error: 'Policy ID is required' }).int().positive('Policy ID must be a positive integer'),
  claimAmount: z.number({ required_error: 'Claim amount is required' }).positive('Claim amount must be greater than 0'),
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters long'),
});

const updateClaimStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    required_error: 'Status must be either approved or rejected',
  }),
});

const validateSubmitClaim = (req, res, next) => {
  if (req.body.policyId && typeof req.body.policyId === 'string') {
    req.body.policyId = parseInt(req.body.policyId, 10);
  }
  if (req.body.claimAmount && typeof req.body.claimAmount === 'string') {
    req.body.claimAmount = parseFloat(req.body.claimAmount);
  }

  const result = submitClaimSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

const validateUpdateClaimStatus = (req, res, next) => {
  const result = updateClaimStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  submitClaimSchema,
  updateClaimStatusSchema,
  validateSubmitClaim,
  validateUpdateClaimStatus,
};
