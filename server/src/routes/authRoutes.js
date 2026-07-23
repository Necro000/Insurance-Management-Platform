const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register - Public
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login - Public
router.post('/login', validateLogin, authController.login);

// GET /api/auth/me - Authenticated
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
