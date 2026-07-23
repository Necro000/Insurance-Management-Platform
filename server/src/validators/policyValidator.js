const { z } = require('zod');

const createPolicySchema = z
  .object({
    customerId: z.number({ required_error: 'Customer ID is required' }).int().positive('Customer ID must be a positive integer'),
    policyType: z.string().trim().min(2, 'Policy type must be at least 2 characters'),
    premiumAmount: z.number({ required_error: 'Premium amount is required' }).positive('Premium amount must be greater than 0').max(10000000, 'Premium amount exceeds limit'),
    startDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
    endDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
    policyNumber: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: 'End date must be strictly after start date',
      path: ['endDate'],
    }
  );

const updatePolicySchema = z.object({
  policyType: z.string().trim().min(2).optional(),
  premiumAmount: z.number().positive().max(10000000).optional(),
  startDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }).optional(),
  endDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }).optional(),
  status: z.enum(['active', 'expired', 'cancelled']).optional(),
});

const validateCreatePolicy = (req, res, next) => {
  // Coerce strings to numbers if sent via form-data/JSON
  if (req.body.customerId && typeof req.body.customerId === 'string') {
    req.body.customerId = parseInt(req.body.customerId, 10);
  }
  if (req.body.premiumAmount && typeof req.body.premiumAmount === 'string') {
    req.body.premiumAmount = parseFloat(req.body.premiumAmount);
  }

  const result = createPolicySchema.safeParse(req.body);
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

const validateUpdatePolicy = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one field must be provided to update',
    });
  }

  if (req.body.premiumAmount && typeof req.body.premiumAmount === 'string') {
    req.body.premiumAmount = parseFloat(req.body.premiumAmount);
  }

  const result = updatePolicySchema.safeParse(req.body);
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
  createPolicySchema,
  updatePolicySchema,
  validateCreatePolicy,
  validateUpdatePolicy,
};
