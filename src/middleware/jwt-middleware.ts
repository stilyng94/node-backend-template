import { NextFunction, Request, Response } from 'express';
import jwtUtils from '../utils/jwt-utils';

function jwtMiddleware(req: Request, _: Response, next: NextFunction) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return next();
	}

	const token = authorizationHeader.split(' ').at(-1);
	if (!token) {
		return next();
	}

	const payload = jwtUtils.verifyAUthToken(token);
	if (!payload) {
		return next();
	}

	req.user = { id: payload };
	return next();
}

export default jwtMiddleware;
