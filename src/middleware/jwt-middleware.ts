import { NextFunction, Request, Response } from 'express';
import jwtHelpers from '../helpers/jwt-helpers';

async function accessTokenMiddleware(
	req: Request,
	_: Response,
	next: NextFunction
) {
	try {
		const token = jwtHelpers.getTokenFromHeader(req);
		if (!token) {
			return next();
		}
		const payload = await jwtHelpers.verifyAccessToken({ token });
		if (!payload) {
			return next();
		}

		req.user = { id: payload.userId };
		return next();
	} catch (error) {
		return next();
	}
}

export default { accessTokenMiddleware };
