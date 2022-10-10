import rateLimit from 'express-rate-limit';

/**
 * @description Request rate limit
 */
const routeRateLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5,
});

export default routeRateLimiter;
