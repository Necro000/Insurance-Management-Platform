const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Validate required environment variables ───────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// ─── Core Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static file serving for uploads ──────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Insurance Management API is running 🏥' });
});

// ─── Routes (stubs — filled in per phase) ─────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/policies',  require('./routes/policyRoutes'));
app.use('/api/claims',    require('./routes/claimRoutes'));
app.use('/api/payments',  require('./routes/paymentRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ─── Global Error Middleware (must be last) ────────────────────────────────
app.use(require('./middleware/errorMiddleware'));

module.exports = app;
