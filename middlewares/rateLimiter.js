const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes (login, register, reset password)
exports.authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Limit each IP to 15 auth requests per 10 minutes
  message: {
    success: false,
    message: 'Too many login or registration attempts, please try again after 10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for search endpoint to prevent abuse
exports.searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please slow down and try again in a minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});
