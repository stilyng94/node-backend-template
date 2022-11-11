import { NextFunction, Request, Response } from 'express';
import routeRateLimiter, { getUsernameIPkey } from '../libs/rate-limit';

const userNameIpLimiterMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let retrySecs = 0;
	const userNameIpKey = getUsernameIPkey(
		req.body.email ?? req.user?.id,
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
			.send({ success: false, errors: [{ message: 'Too Many Requests' }] });
	}

	req.userNameIpKey = userNameIpKey;

	return next();
};

const IpLimiterMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let retrySecs = 0;

	const resIP = await routeRateLimiter.get(req.ip);

	// Check if IP is already blocked
	if (resIP !== null && resIP.remainingPoints === 0) {
		retrySecs = Math.round(resIP.msBeforeNext / 1000) || 1;
	}

	if (retrySecs > 0) {
		res.set('X-Retry-After', String(retrySecs));
		return res
			.status(429)
			.send({ success: false, errors: [{ message: 'Too Many Requests' }] });
	}

	return next();
};

export default { userNameIpLimiterMiddleware, IpLimiterMiddleware };
