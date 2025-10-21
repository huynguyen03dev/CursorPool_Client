const rateLimit = require('express-rate-limit')

// Rate limiter for sendEmailCode endpoint (5 requests per 15 minutes)
const sendEmailCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 429,
    msg: 'Too many email code requests. Please try again later.',
    data: null,
    code: '429',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Rate limiter for other auth endpoints (100 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    status: 429,
    msg: 'Too many authentication requests. Please try again later.',
    data: null,
    code: '429',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  sendEmailCodeLimiter,
  authLimiter,
}
