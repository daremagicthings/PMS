import rateLimit from 'express-rate-limit';

/**
 * Stricter rate limiter for external 3rd-party API calls (e.g., Qpay, Ebarimt)
 * to prevent abuse and excessive costs.
 */
export const externalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` for external APIs
  message: { success: false, message: 'Too many requests to external services, please try again later.' }
});
