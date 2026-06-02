const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./middlewares/logger');

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
  res.json({
    success: true,
    message: 'Welcome to Meta Glasses Reviews API'
  });
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


module.exports = app;
