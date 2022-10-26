import crypto from 'crypto';
import { OauthProvider, User } from '@prisma/client';
import { Request } from 'express';
import { VerifyCallback } from 'passport-oauth2';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import {
	OAuth2Client as GoogleOAuth2Client,
	TokenPayload,
} from 'google-auth-library';
import jwksClient from 'jwks-rsa';
import { IEmailObj } from '../interfaces/mail-interfaces';
import dbClient from '../libs/db-client';
import mailHelpers from './mail-helpers';
import BadRequestError from '../errors/bad-request-error';
import redisClient from '../libs/redis-client';
import constants from '../resources/constants';
import cryptoUtils from '../utils/crypto-utils';
import logger from '../libs/logger';
import routeRateLimiter from '../libs/rate-limit';

type DecodedPayload = jsonwebtoken.JwtPayload | TokenPayload;

const verifyGoogleOauthToken = async (token: string) => {
	const client = new GoogleOAuth2Client(
		process.env.GOOGLE_CLIENT_ID ?? 'clientId'
	);
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_CLIENT_ID ?? 'clientId',
	});
	return ticket.getPayload();
};

const verifyFacebookOauthToken = async (token: string) => {
	const client = jwksClient({
		jwksUri: constants.urls.facebookJwkUrl,
	});
	const decodedPayload = jsonwebtoken.decode(token, { complete: true });
	if (!decodedPayload) {
		return null;
	}
	const signingKey = await client.getSigningKey(decodedPayload.header.kid);
	const publicKey = signingKey.getPublicKey();
	const metadata = jsonwebtoken.verify(token, publicKey, {
		algorithms: ['RS256'],
	}) as JwtPayload;
	return metadata;
};

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

const upsertOauthAccount = async (
	provider: OauthProvider,
	decodedPayload: DecodedPayload
) => {
	try {
		let user: User | null;

		if (Object.keys(decodedPayload).length < 1) {
			return {
				error: true,
			};
		}

		const oAuthAccount = await dbClient.oauthCredential.findUnique({
			where: {
				provider_subject: {
					provider,
					subject: decodedPayload.sub!,
				},
			},
		});

		if (oAuthAccount) {
			// Oauth account has been setup before
			user = await dbClient.user.findUnique({
				where: { id: oAuthAccount.userId },
			});
			if (!user) {
				return {
					error: true,
				};
			}
			return { error: false, user };
		}

		// New account and oauth account

		user = await dbClient.user.create({
			data: {
				email: decodedPayload.email,
				password: 'fdkdl940#2fdsj',
				OauthCredential: {
					create: {
						provider,
						subject: decodedPayload.sub!,
					},
				},
			},
		});

		if (!user) {
			return {
				error: true,
			};
		}
		return { error: false, user, isNew: true };
	} catch (error) {
		logger.error(error);
		return {
			error: true,
		};
	}
};

const oauthStrategyVerifyHandler = async (
	req: Request,
	provider: OauthProvider,
	params: Record<string, string | Array<string>>,
	cb: VerifyCallback
) => {
	const idToken = params.id_token as string;

	let decodedPayload: DecodedPayload | null | undefined;

	if (provider === 'facebook') {
		decodedPayload = await verifyFacebookOauthToken(idToken);
	} else if (provider === 'google') {
		decodedPayload = await verifyGoogleOauthToken(idToken);
	}
	logger.info(decodedPayload, 'profile');

	if (!decodedPayload) {
		await routeRateLimiter.consume(req.ip, 2);
		return cb(
			new BadRequestError('Could not login or create account from provider')
		);
	}

	const result = await upsertOauthAccount(provider, decodedPayload);
	if (result.error) {
		await routeRateLimiter.consume(req.ip, 2);
		return cb(
			new BadRequestError('Could not login or create account from provider')
		);
	}

	const resIP = await routeRateLimiter.get(req.ip);

	if (resIP !== null && resIP.consumedPoints > 0) {
		await routeRateLimiter.delete(req.ip);
	}
	return cb(null, result.user, { isNew: result.isNew });
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
	oauthStrategyVerifyHandler,
};
