const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Cross-Origin Request Blocked by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging (disable in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const mongoose = require('mongoose');

// Health Check API
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    message: 'SpendSmart API service is running normally',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Middleware to notify gracefully if database is offline (in non-test environments)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MongoDB is running or configure your MONGODB_URI in server/.env.'
    });
  }
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// 404 Not Found Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
