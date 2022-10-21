import crypto from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import redisClient from '../libs/redis-client';
import constants from '../resources/constants';

async function generateResetPasswordUrl(userId: string): Promise<string> {
	const secret = crypto.randomBytes(32).toString('hex');

	await redisClient.setEx(
		`${constants.prefix.prefixResetPassword}${secret}`,
		3600,
		userId
	);

	return `${process.env.FRONTEND_URL}/${constants.resetPasswordUrl}/${secret}`;
}

async function decodeResetPassword(token: string): Promise<string> {
	const userId = await redisClient.getDel(
		`${constants.prefix.prefixResetPassword}${token}`
	);

	if (!userId) {
		throw new BadRequestError('token expired, please try again');
	}
	return userId;
}

export default { generateResetPasswordUrl, decodeResetPassword };
