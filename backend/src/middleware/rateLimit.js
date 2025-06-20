const rateLimit = require('express-rate-limit');

// Rate limiting configuration from environment variables
const createRateLimiter = (options = {}) => {
  const {
    windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes default
    max = process.env.RATE_LIMIT_MAX || 100, // 100 requests per window default
    message = process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
    standardHeaders = process.env.RATE_LIMIT_STANDARD_HEADERS !== 'false', // true by default
    legacyHeaders = process.env.RATE_LIMIT_LEGACY_HEADERS !== 'false', // true by default
    skipSuccessfulRequests = process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true', // false by default
    skipFailedRequests = process.env.RATE_LIMIT_SKIP_FAILED === 'true', // false by default
  } = options;

  return rateLimit({
    windowMs: parseInt(windowMs),
    max: parseInt(max),
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        windowMs: windowMs
      });
    }
  });
};

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter();
const authLimiter = createRateLimiter({
  windowMs: process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.AUTH_RATE_LIMIT_MAX || 5, // 5 attempts per 15 minutes for auth
  message: process.env.AUTH_RATE_LIMIT_MESSAGE || 'Too many authentication attempts, please try again later.'
});

module.exports = {
  generalLimiter,
  authLimiter,
  createRateLimiter
}; 