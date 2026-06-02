const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./middlewares/logger');
const { sendResponse } = require('./utils/responseHelper');

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

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

// Mount routers
app.use('/reviews', filterRoutesRouter);
app.use('/reviews', extraParamRoutesRouter);
app.use('/reviews', reviewsRouter);
app.use('/users', usersRouter);
app.use('/countries', countriesRouter);
app.use('/search', searchRouter);
app.use('/', metadataRouter);
app.use('/', paramRoutesRouter);

const errorHandler = require('./middlewares/error');

// Centralized error handler
app.use(errorHandler);

module.exports = app;
