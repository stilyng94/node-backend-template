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

	await redisClient.setex(
		`${constants.prefix.prefixResetPassword}${secret}`,
		3600,
		userId
	);

	return `${process.env.FRONTEND_URL}/${constants.resetPasswordUrl}/${secret}`;
}

async function decodeResetPasswordToken(token: string): Promise<string> {
	const userId = await redisClient.getdel(
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

const verifyPassword = async (password: string, hashedPassword = '') => {
	try {
		const [key, salt] = hashedPassword.split('.');
		const keyBuffer = Buffer.from(key, 'hex');

		const derivedKey = (await cryptoUtils.asyncScrypt(
			password,
			salt,
			64
		)) as Buffer;
		return crypto.timingSafeEqual(keyBuffer, derivedKey);
	} catch (_) {
		return false;
	}
};

const createUser = async (email: string, password: string) => {
	const hashedPassword = await hashPassword(password);
	const user = await dbClient.user.create({
		data: { email, password: hashedPassword },
	});
	return user;
};

const loginUser = async (email: string, password: string) => {
	const user = await dbClient.user.findUnique({ where: { email } });
	const verified = await verifyPassword(password, user?.password);

	if (!verified) {
		return {
			error: true,
			errorMessage:
				'Invalid login credentials. Remember that password is case-sensitive. Please try again',
		};
	}
	return { error: false, user };
};

const sendResetPasswordMail = async (email: string, userId: string) => {
	const emailObj: IEmailObj = {
		from: process.env.FROM_ADDRESS ?? 'noreply@mail.com',
		subject: 'Reset Password',
		to: [email],
	};
	const resetLink = await generateResetPasswordUrl(userId);
	await mailHelpers.sendMail(emailObj, '', { resetLink });
};

const sendResetPasswordSuccessMail = async (email: string) => {
	const emailObj: IEmailObj = {
		from: process.env.FROM_ADDRESS ?? 'noreply@mail.com',
		subject: 'Reset Password Successful',
		to: [email],
	};
	await mailHelpers.sendMail(emailObj, '', {});
};

const updatePassword = async (token: string, password: string) => {
	const userId = await decodeResetPasswordToken(token);
	const newHashedPassword = await hashPassword(password);
	const count = await dbClient.user.count({ where: { id: userId } });
	if (count === 0) {
		throw new BadRequestError('token expired, please try again');
	}
	return dbClient.user.update({
		where: { id: userId },
		data: { password: newHashedPassword },
	});
};

export default {
	sendNewAccountMail,
	sendResetPasswordMail,
	updatePassword,
	hashPassword,
	createUser,
	generateResetPasswordUrl,
	sendResetPasswordSuccessMail,
	decodeResetPasswordToken,
	verifyPassword,
	loginUser,
};
