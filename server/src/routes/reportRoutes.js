const express = require('express');
const router = express.Router();

// TODO: Implement in Phase 8
router.all('/{*path}', (req, res) => res.status(501).json({ success: false, message: 'Not implemented yet' }));

module.exports = router;
