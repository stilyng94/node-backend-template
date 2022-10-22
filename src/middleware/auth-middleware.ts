import { NextFunction, Request, Response } from 'express';
import dbClient from '../libs/db-client';

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.session.isAuthenticated || !req.session.userId) {
		return res.status(401).json({ success: false, message: 'unauthorized' });
	}
	const user = await dbClient.user.findUnique({
		where: { id: req.session.userId },
	});
	req.user = user ?? undefined;
	return next();
}

export default authMiddleware;
