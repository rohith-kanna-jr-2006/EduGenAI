/**
 * EcoGen AI - Rate Limiter Middleware
 * 
 * Protects endpoints from abuse and prevents accidental rapid API consumption.
 */

const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutes default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 30; // 30 requests per window default

const generateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  validate: false,       // Suppress proxy header validation warnings in hosted proxy environments
  statusCode: 429,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many image generation requests from this IP address. Please slow down and try again later.',
        retryAfterSeconds: Math.ceil(windowMs / 1000)
      }
    });
  }
});

module.exports = {
  generateLimiter
};
