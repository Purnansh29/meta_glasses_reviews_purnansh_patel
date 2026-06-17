const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to database
connectDB();

const logger = require('./middlewares/logger');
const { sendResponse } = require('./utils/responseHelper');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      return origin === allowed || origin.endsWith(allowed);
    });

    if (isAllowed || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Apply global rate limiter
app.use(apiLimiter);

// Handle OPTIONS and HEAD requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Custom request logger
app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic route for testing
app.get('/', (req, res) => {
  sendResponse(res, 200, true, 'Welcome to Meta Glasses Reviews API');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongooseState = require('mongoose').connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const dbStatus = states[mongooseState] || 'unknown';
  
  res.json({
    success: true,
    status: 'UP',
    database: dbStatus,
    timestamp: new Date()
  });
});

// Import routers
const filterRoutesRouter = require('./routes/filterRoutes');
const extraParamRoutesRouter = require('./routes/extraParamRoutes');
const reviewsRouter = require('./routes/reviews');
const usersRouter = require('./routes/users');
const countriesRouter = require('./routes/countries');
const metadataRouter = require('./routes/metadata');
const paramRoutesRouter = require('./routes/paramRoutes');
const searchRouter = require('./routes/search');
const statsRouter = require('./routes/stats');
const authRouter = require('./routes/auth');
const jwtRouter = require('./routes/jwt');
const adminRouter = require('./routes/admin');
const compareRouter = require('./routes/compare');

// Mount routers
app.use('/reviews/stats', statsRouter);
app.use('/reviews', filterRoutesRouter);
app.use('/reviews', extraParamRoutesRouter);
app.use('/reviews', compareRouter);
app.use('/reviews', reviewsRouter);
app.use('/users', usersRouter);
app.use('/countries', countriesRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);
app.use('/jwt', jwtRouter);
app.use('/admin', adminRouter);
app.use('/', metadataRouter);
app.use('/', paramRoutesRouter);

const errorHandler = require('./middlewares/error');

// Centralized error handler
app.use(errorHandler);

module.exports = app;
