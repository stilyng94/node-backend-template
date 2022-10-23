import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../../errors/bad-request-error';
import NotAuthorizedError from '../../errors/not-authorized-error';
import authHelpers from '../../helpers/auth-helpers';
import dbClient from '../../libs/db-client';
import logger from '../../libs/logger';
import routeRateLimiter from '../../libs/rate-limit';

async function newAccount(req: Request, res: Response) {
	try {
		const { email, password } = req.body;
		await authHelpers.createUser(email, password);
		authHelpers.sendNewAccountMail(email);
		return res.status(200).json({
			success: true,
			message:
				'A link to activate your account has been emailed to the address provided',
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).json({
			success: false,
			message:
				'Sorry, we were unable to create your account. Please try again. If the issue continues, please contact Customer Support',
		});
	}
}

async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const { userNameIpKey } = req;

		const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey!);

		const { password, email } = req.body;
		const loginResult = await authHelpers.loginUser(email, password);

		if (loginResult.error) {
			await routeRateLimiter.consume(userNameIpKey!);
			throw new NotAuthorizedError(loginResult.errorMessage);
		}

		if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
			await routeRateLimiter.delete(userNameIpKey!);
		}
		req.session.isAuthenticated = true;
		req.session.user = loginResult.user!;

		return res.status(200).json({ success: true });
	} catch (error) {
		return next(error);
	}
}

async function logout(req: Request, res: Response, next: NextFunction) {
	try {
		return req.session.destroy(() => res.status(200).json({ success: true }));
	} catch (error) {
		return next();
	}
}

async function changePassword(req: Request, res: Response, next: NextFunction) {
	try {
		const { newPassword, currentPassword } = req.body;
		const { userNameIpKey } = req;

		const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey!);

		const user = await dbClient.user.findUnique({
			where: { id: req.session.user?.id },
		});

		const verified = await authHelpers.verifyPassword(
			currentPassword,
			user?.password
		);
		if (!verified) {
			await routeRateLimiter.consume(userNameIpKey!);

			throw new BadRequestError('Does not match the current password');
		}
		const newHashedPassword = await authHelpers.hashPassword(newPassword);

		await dbClient.user.update({
			where: { id: req.session.user?.id },
			data: { password: newHashedPassword },
		});

		if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
			await routeRateLimiter.delete(userNameIpKey!);
		}
		return res.status(200).json({ success: true });
	} catch (error) {
		return next(error);
	}
}

async function beginPasswordRecovery(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		await routeRateLimiter.consume(req.ip, 2);

		const { email } = req.body;

		const user = await dbClient.user.findUnique({ where: { email } });
		if (user) {
			authHelpers.sendResetPasswordMail(email, user.id);
		}

		return res.status(200).json({
			success: true,
			message:
				'If that email address is in our database, we will send you an email to reset your password.',
		});
	} catch (error) {
		return next(error);
	}
}

async function submitPasswordRecovery(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { password, token } = req.body;

		const resIP = await routeRateLimiter.get(req.ip);

		const user = await authHelpers.updatePassword(token, password);

		if (resIP !== null && resIP.consumedPoints > 0) {
			await routeRateLimiter.delete(req.ip);
		}
		authHelpers.sendResetPasswordSuccessMail(user.email);

		return res.status(200).json({ success: true });
	} catch (error) {
		await routeRateLimiter.consume(req.ip, 2);
		return next(error);
	}
}

export default {
	changePassword,
	newAccount,
	login,
	beginPasswordRecovery,
	submitPasswordRecovery,
	logout,
};

// TODO: Require Re-authentication for Sensitive Features
