const { z } = require('zod');

const recordPaymentSchema = z.object({
  policyId: z.number({ required_error: 'Policy ID is required' }).int().positive('Policy ID must be a positive integer'),
  amount: z.number({ required_error: 'Payment amount is required' }).positive('Payment amount must be greater than 0'),
  paymentDate: z.string().trim().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid payment date format' }),
  paymentStatus: z.enum(['paid', 'pending', 'overdue']).optional().default('paid'),
});

const validateRecordPayment = (req, res, next) => {
  if (req.body.policyId && typeof req.body.policyId === 'string') {
    req.body.policyId = parseInt(req.body.policyId, 10);
  }
  if (req.body.amount && typeof req.body.amount === 'string') {
    req.body.amount = parseFloat(req.body.amount);
  }

  const result = recordPaymentSchema.safeParse(req.body);
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
  recordPaymentSchema,
  validateRecordPayment,
};
