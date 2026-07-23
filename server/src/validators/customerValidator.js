const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  dob: z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
    .refine(
      (val) => {
        const birthDate = new Date(val);
        const today = new Date();
        return birthDate <= today;
      },
      { message: 'Date of birth cannot be in the future' }
    )
    .refine(
      (val) => {
        const birthDate = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      },
      { message: 'Customer must be at least 18 years old' }
    ),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number format'),
  address: z.string().trim().min(5, 'Address must be at least 5 characters'),
  email: z.string().trim().email('Invalid email address'),
});

const updateCustomerSchema = createCustomerSchema.partial();

const validateCreateCustomer = (req, res, next) => {
  const result = createCustomerSchema.safeParse(req.body);
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

const validateUpdateCustomer = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one field must be provided to update',
    });
  }
  const result = updateCustomerSchema.safeParse(req.body);
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
  createCustomerSchema,
  updateCustomerSchema,
  validateCreateCustomer,
  validateUpdateCustomer,
};
