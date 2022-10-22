import crypto from 'crypto';
import { IEmailObj } from '../interfaces/mail-interfaces';
import dbClient from '../libs/db-client';
import mailHelpers from './mail-helpers';
import BadRequestError from '../errors/bad-request-error';
import redisClient from '../libs/redis-client';
import constants from '../resources/constants';
import cryptoUtils from '../utils/crypto-utils';

async function generateResetPasswordUrl(userId: string): Promise<string> {
	const secret = (await cryptoUtils.asyncRandomBytes(32)).toString('hex');

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

const sendNewAccountMail = async (email: string) => {
	const emailObj: IEmailObj = {
		from: process.env.FROM_ADDRESS ?? 'noreply@mail.com',
		subject: 'New Account',
		to: [email],
	};
	await mailHelpers.sendMail(emailObj, '', { email });
};

const hashPassword = async (password: string) => {
	const salt = (await cryptoUtils.asyncRandomBytes(32)).toString('hex');
	const derivedKey = (await cryptoUtils.asyncScrypt(
		password,
		salt,
		64
	)) as Buffer;
	const hashedPassword = `${derivedKey.toString('hex')}.${salt}`;
	return hashedPassword;
};

const verifyPassword = async (password: string, hashedPassword: string) => {
	const [key, salt] = hashedPassword.split('.');
	const keyBuffer = Buffer.from(key, 'hex');

	const derivedKey = (await cryptoUtils.asyncScrypt(
		password,
		salt,
		64
	)) as Buffer;
	return crypto.timingSafeEqual(keyBuffer, derivedKey);
};

const createUser = async (email: string, password: string) => {
	const hashedPassword = await hashPassword(password);
	const user = await dbClient.user.create({
		data: { email, password: hashedPassword },
	});
	return user;
};

export default {
	sendNewAccountMail,
	hashPassword,
	createUser,
	generateResetPasswordUrl,
	decodeResetPassword,
	verifyPassword,
};
