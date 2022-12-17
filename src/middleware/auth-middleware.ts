import { NextFunction, Request, Response } from 'express';
import NotAuthenticatedError from '../errors/not-authenticated-error';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.user?.id) {
		throw new NotAuthenticatedError();
	}
	return next();
}

export default authMiddleware;
