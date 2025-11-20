import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Demo user emails that bypass rate limiting
const DEMO_EMAILS = [
  'sitarai@safa.com',
  'aaravsharma@safa.com',
  'demouser@safa.com',
  'rajeshhamal@safa.com',
  'admin@safa.com',
];

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Demo users bypass rate limiting
 */
export const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes (reduced from 15)
  max: 10, // 10 attempts (increased from 5)
  skip: (req) => {
    // Skip rate limiting for demo user emails
    const email = req.body?.email;
    return email && DEMO_EMAILS.includes(email.toLowerCase());
  },
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 2 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for password change
 */
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: {
    success: false,
    message: 'Too many password change attempts, please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
