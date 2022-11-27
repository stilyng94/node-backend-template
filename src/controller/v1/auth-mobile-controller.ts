import { NextFunction, Request, Response } from 'express';

async function githubOauth(req: Request, res: Response, next: NextFunction) {
	try {
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

export default {
	githubOauth,
};
