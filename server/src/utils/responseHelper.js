/**
 * Standardized API response helpers.
 * Always use these to keep the response shape consistent across all routes.
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {any} data - Response payload
 * @param {string} message - Human-readable success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a created response (201).
 * @param {object} res - Express response object
 * @param {any} data - Newly created resource
 * @param {string} message - Human-readable message
 */
const created = (res, data = null, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a paginated list response.
 * @param {object} res - Express response object
 * @param {Array} data - Array of records
 * @param {object} meta - Pagination metadata { total, page, limit, totalPages }
 * @param {string} message - Human-readable message
 */
const paginated = (res, data = [], meta = {}, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} errors - Optional field-level errors (e.g. from Zod)
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { success, created, paginated, error };
