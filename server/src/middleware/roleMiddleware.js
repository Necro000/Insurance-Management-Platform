const { error } = require('../utils/responseHelper');

/**
 * Role Middleware — restricts route access by user role.
 * Must be used AFTER authMiddleware (requires req.user to be set).
 *
 * Usage: router.get('/admin-only', authMiddleware, requireRole('admin'), controller)
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'agent', 'customer')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // EC-RB08: Role missing from decoded token
    if (!req.user || !req.user.role) {
      return error(res, 'Access denied. Role information is missing.', 403);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. This action requires one of: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

module.exports = { requireRole };
