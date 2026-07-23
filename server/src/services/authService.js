const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwtUtils');

/**
 * Register a new user.
 * @param {object} data - { name, email, password, role }
 * @returns {Promise<object>} Created user object (without password)
 */
const registerUser = async (data) => {
  const { name, email, password, role } = data;

  // EC-A01: Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }

  // Hash password with 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // EC-A06: Default role is customer unless explicitly specified
  const userRole = role || 'customer';

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole,
    },
  });

  // Omit password from returned user object
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Login user and return JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>} Token and user object
 */
const loginUser = async (email, password) => {
  // EC-A10: Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // EC-A09 & EC-A10: Generic 401 error to avoid user enumeration
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Sign JWT token
  const token = signToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword,
  };
};

/**
 * Get user details by ID.
 * @param {number} userId
 * @returns {Promise<object>} User object without password
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
