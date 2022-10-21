import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import redisClient from './redis-client';

const maxConsecutiveFailsByUsernameAndIP = 10;

// Insurance just incase Redis goes down or not available
const rateLimiterMemory = new RateLimiterMemory({});

const routeRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	insuranceLimiter: rateLimiterMemory,
	keyPrefix: 'fail_consecutive_username_and_ip',
	execEvenly: false,
	points: maxConsecutiveFailsByUsernameAndIP, // attempts
	duration: 15 * 60, // within 15minutes
	blockDuration: 60 * 60, // Block for 1hr
});

export const getUsernameIPkey = (username: string, ip: string) =>
	`${username}_${ip}`;

export default routeRateLimiter;
