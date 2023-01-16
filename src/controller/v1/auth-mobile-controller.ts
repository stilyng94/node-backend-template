import { Request, Response, NextFunction } from 'express';
import authHelpers from '@/helpers/auth-helpers';
import jwtHelpers from '@/helpers/jwt-helpers';
import config from '@/config';

async function newOrConnectOauthAccount(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { provider, oauthUser } = req.body;
		const { error, isNew, msg, user } = await authHelpers.upsertOauthAccount(
			req,
			provider,
			oauthUser
		);
		if (error) {
			return res.status(400).json({ success: false, message: msg });
		}

		const jsonResponse: {
			success: boolean;
			accessToken?: string;
			refreshToken?: string;
			message?: string;
		} = {
			success: true,
		};

		if (isNew) {
			// send email
			await authHelpers.sendNewAccountMail(oauthUser.email);
			jsonResponse.message =
				'A link to activate your account has been emailed to the address provided';
		}

		if (!config.USE_SESSION) {
			const { accessToken, refreshToken } = await jwtHelpers.generateAuthTokens(
				{
					userId: user?.id,
				}
			);

			jsonResponse.accessToken = accessToken;
			jsonResponse.refreshToken = refreshToken;
		}
		return res.status(200).json(jsonResponse);
	} catch (error) {
		return next(error);
	}
}

export default { newOrConnectOauthAccount };
