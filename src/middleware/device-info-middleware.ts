import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

function deviceInfoMiddleware(req: Request, _: Response, next: NextFunction) {
	if (!req.session.deviceInfoHash) {
		const userAgent = req.headers['user-agent'] ?? '';
		const hash = crypto.createHash('md5');
		hash.update(userAgent, 'utf8');
		req.session.deviceInfoHash = hash.digest('hex') ?? '';
	}
	return next();
}

export default deviceInfoMiddleware;
