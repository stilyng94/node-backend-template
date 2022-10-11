import rateLimit from 'express-rate-limit';

/**
 * @description Request rate limit
 */
const routeRateLimiter = rateLimit({});

export default routeRateLimiter;
