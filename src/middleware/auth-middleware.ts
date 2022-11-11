import { NextFunction, Request, Response } from 'express';
import NotAuthorizedError from '../errors/not-authorized-error';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.user) {
		throw new NotAuthorizedError();
	}
	return next();
}

export default authMiddleware;
