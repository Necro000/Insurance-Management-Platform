/**
 * Global Error Middleware — must be the LAST middleware registered in app.js
 * Handles Zod validation errors, Prisma errors, and generic server errors.
 */
const errorMiddleware = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // ─── Zod Validation Error ──────────────────────────────────────────────────
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // ─── Prisma Errors ─────────────────────────────────────────────────────────
  if (err.code === 'P2025') {
    // EC-DB07: Record not found
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  if (err.code === 'P2002') {
    // EC-DB08: Unique constraint violation (duplicate email, policy number, etc.)
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  if (err.code === 'P2003') {
    // Foreign key constraint failure (e.g. creating policy for non-existent customer)
    return res.status(400).json({
      success: false,
      message: 'Related record not found. Please check the referenced ID.',
    });
  }

  // ─── Multer Errors (file upload) ───────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File is too large. Max allowed is 5MB.' });
  }

  // ─── Custom App Errors (thrown with err.statusCode) ───────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // ─── Generic Server Error ──────────────────────────────────────────────────
  // EC-API09: Never leak stack traces in production
  console.error('❌ Unhandled Error:', err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
