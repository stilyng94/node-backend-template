import { NextFunction, Request, Response } from 'express';
import routeRateLimiter, { getUsernameIPkey } from '../libs/rate-limit';

const userNameIpLimiterMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let retrySecs = 0;
	const userNameIpKey = getUsernameIPkey(
		req.body.email ?? 'mail@mail.com',
		req.ip
	);
	const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey);

	// Check if IP or Username + IP is already blocked
	if (resUsernameAndIP !== null && resUsernameAndIP.remainingPoints === 0) {
		retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
	}

	if (retrySecs > 0) {
		res.set('X-Retry-After', String(retrySecs));
		return res
			.status(429)
			.send({ success: false, message: 'Too Many Requests' });
	}

	req.userNameIpKey = userNameIpKey;

	return next();
};

export default { userNameIpLimiterMiddleware };
