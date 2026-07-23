const { verifyToken } = require('../utils/jwtUtils');
const { error } = require('../utils/responseHelper');

/**
 * Auth Middleware — verifies the JWT in the Authorization header.
 * Attaches decoded payload as req.user = { userId, role, email }
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // EC-A14: No Authorization header present
  if (!authHeader) {
    return error(res, 'Authorization header is missing', 401);
  }

  // EC-A17: Handle malformed header (not "Bearer <token>")
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return error(res, 'Authorization header format must be: Bearer <token>', 401);
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, role, email }
    next();
  } catch (err) {
    // EC-A15: Malformed token | EC-A16: Expired token
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please log in again.', 401);
    }
    return error(res, 'Invalid token. Please log in again.', 401);
  }
};

module.exports = authMiddleware;
