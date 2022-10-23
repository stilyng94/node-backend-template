import { NextFunction, Request, Response } from 'express';

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.session.isAuthenticated || !req.session.user) {
		return res.status(401).json({ success: false, message: 'unauthorized' });
	}
	return next();
}

export default authMiddleware;
