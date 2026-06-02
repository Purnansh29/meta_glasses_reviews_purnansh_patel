const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

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

module.exports = app;
