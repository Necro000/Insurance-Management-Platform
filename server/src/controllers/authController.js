const authService = require('../services/authService');
const { created, success } = require('../utils/responseHelper');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return created(res, user, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 * @access Authenticated
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    return success(res, user, 'Current user retrieved successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
