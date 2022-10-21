import { NextFunction, Request, Response } from 'express';
import dbClient from '../../libs/db-client';
import logger from '../../libs/logger';

function newAccount(req: Request, res: Response, next: NextFunction) {
	try {
		// If mail exist OR was a success, 'A link to activate your account has been emailed to the address provided.'
		// Password length 8>=and <=64
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

async function login(req: Request, res: Response, next: NextFunction) {
	try {
		// If error, 'Login failed; Invalid user ID or password'
		// Consume 1 point from limiters on wrong attempt and block if limits reached
		// Reset on successful authorization

		logger.info(req.userNameIpKey, 'userNameIpKey');
		const userCount = await dbClient.user.count();
		logger.info(userCount, 'user count');
		logger.info(req.deviceInfo, 'device Information');

		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

function changePassword(req: Request, res: Response, next: NextFunction) {
	try {
		// User is authenticated

		// check password that was sent for verification

		// If good then, update current password

		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

function beginPasswordRecovery(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		// If mail exist OR was a success, 'If that email address is in our database, we will send you an email to reset your password.'

		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

function passwordRecovery(req: Request, res: Response, next: NextFunction) {
	try {
		// Update password

		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

export default {
	changePassword,
	newAccount,
	login,
	beginPasswordRecovery,
	passwordRecovery,
};

// TODO: Require Re-authentication for Sensitive Features
