import rateLimit from 'express-rate-limit';
export const generateRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: {
    error: 'Too many generation requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many API requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});