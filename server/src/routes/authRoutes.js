const express = require('express');
const router = express.Router();

// Controllers will be added in Phase 2
// POST /api/auth/register
router.post('/register', (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' }));

// POST /api/auth/login
router.post('/login', (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' }));

// GET /api/auth/me
router.get('/me', (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' }));

module.exports = router;
