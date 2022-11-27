import crypto from 'crypto';
import { Account, OauthProvider } from '@prisma/client';
import { Request } from 'express';
import { VerifyCallback } from 'passport-oauth2';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { OAuth2Client as GoogleOAuth2Client } from 'google-auth-library';
import JwksRsa from 'jwks-rsa';
import axios from 'axios';
import { IEmailObj } from '../interfaces/mail-interfaces';
import dbClient from '../libs/db-client';
import mailHelpers from './mail-helpers';
import BadRequestError from '../errors/bad-request-error';
import redisClient from '../libs/redis-client';
import constants from '../resources/constants';
import cryptoUtils from '../utils/crypto-utils';
import logger from '../libs/logger';
import routeRateLimiter from '../libs/rate-limit';
import OauthUser from '../interfaces/oauth-user';

const verifyGoogleOauthToken = async (
	token: string
): Promise<OauthUser | null> => {
	const client = new GoogleOAuth2Client(
		process.env.GOOGLE_CLIENT_ID ?? 'clientId'
	);
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_CLIENT_ID ?? 'clientId',
	});
	const metadata = ticket.getPayload();
	if (!metadata) {
		return null;
	}
	return {
		email: metadata.email!,
		id: metadata.sub,
		name: metadata.name,
		firstName: metadata.given_name,
		lastName: metadata.family_name,
	};
};

const verifyFacebookOauthToken = async (
	token: string
): Promise<OauthUser | null> => {
	try {
		const jwksClient = JwksRsa({
			jwksUri: constants.urls.facebookJwkUrl,
			rateLimit: true,
			cache: true,
		});
		const decodedPayload = jsonwebtoken.decode(token, { complete: true });
		if (!decodedPayload) {
			return null;
		}
		const signingKey = await jwksClient.getSigningKey(
			decodedPayload.header.kid
		);
		const publicKey = signingKey.getPublicKey();
		const metadata = jsonwebtoken.verify(token, publicKey, {
			algorithms: ['RS256'],
		}) as JwtPayload;
		return {
			email: metadata.email,
			id: metadata.sub!,
			name: metadata.name,
			firstName: metadata.firstname,
			lastName: metadata.lastname,
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
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
	await mailHelpers.sendMail(emailObj, 'new-account', {
		email,
	});
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

const createUser = async (
	email: string,
	password: string,
	accountId?: string
) => {
	const hashedPassword = await hashPassword(password);
	let info = null;

	// check if an oauth account has same email
	const existOauthAccount = await dbClient.userOauthCredential.findFirst({
		where: { email },
	});
	if (existOauthAccount) {
		info = `Email was already used to login with ${existOauthAccount.provider}`;
	}

	const user = await dbClient.userLocalCredential.create({
		data: {
			email,
			password: hashedPassword,
			Account: { connectOrCreate: { create: {}, where: { id: accountId } } },
		},
	});
	return { user, info };
};

const loginUser = async (email: string, password: string) => {
	const user = await dbClient.userLocalCredential.findUnique({
		where: { email },
	});
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
	await mailHelpers.sendMail(emailObj, 'reset-password', { resetLink });
};

const sendResetPasswordSuccessMail = async (email: string) => {
	const emailObj: IEmailObj = {
		from: process.env.FROM_ADDRESS ?? 'noreply@mail.com',
		subject: 'Reset Password Successful',
		to: [email],
	};
	await mailHelpers.sendMail(emailObj, 'reset-password-success', {});
};

const updatePassword = async (token: string, password: string) => {
	const userId = await decodeResetPasswordToken(token);
	const newHashedPassword = await hashPassword(password);
	const count = await dbClient.userLocalCredential.count({
		where: { id: userId },
	});
	if (count === 0) {
		throw new BadRequestError('token expired, please try again');
	}
	return dbClient.userLocalCredential.update({
		where: { id: userId },
		data: { password: newHashedPassword },
	});
};

const verifyGithubOauthToken = async (
	idToken: string
): Promise<OauthUser | null> => {
	try {
		const { data } = await axios.get('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		});

		return { email: data.email, id: data.id, name: data.name };
	} catch (err) {
		logger.error(err);
		return null;
	}
};

const upsertOauthAccount = async (
	req: Request,
	provider: OauthProvider,
	decodedPayload: OauthUser
) => {
	try {
		let user: Account | null;

		if (Object.keys(decodedPayload).length < 1) {
			return {
				error: true,
			};
		}

		const oAuthAccount = await dbClient.userOauthCredential.findUnique({
			where: {
				provider_subject: {
					provider,
					subject: decodedPayload.id,
				},
			},
		});

		if (!oAuthAccount) {
			if (!req.user) {
				//! New account and oauth account => SIGNUP
				user = await dbClient.account.create({
					data: {
						UserOauthCredential: {
							create: {
								provider,
								subject: decodedPayload.id,
								email: decodedPayload.email,
								firstName: decodedPayload.firstName,
								lastName: decodedPayload.lastName,
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
			}
			//! New OAUTH & OAUTH LINKING

			await dbClient.userOauthCredential.create({
				data: {
					provider,
					accountId: req.user.id,
					subject: decodedPayload.id,
					email: decodedPayload.email,
					firstName: decodedPayload.firstName,
					lastName: decodedPayload.lastName,
				},
			});
			return { error: false, user: req.user };
		}

		//! when oauth exists

		if (req.user) {
			//! Existing OAUTH & OAUTH LINKING
			// Check if already linked
			if (oAuthAccount.accountId === req.user.id) {
				// Already linked
				return { error: false, user: req.user, msg: 'already linked' };
			}
			// LINK & UPDATE RECORDS THAT WHERE LINKED TO OLD ACCOUNT_ID
			await dbClient.userOauthCredential.updateMany({
				where: { accountId: oAuthAccount.accountId },
				data: { accountId: req.user.id },
			});

			return { error: false, user: req.user, msg: 'link success' };
		}
		// LOGIN
		user = await dbClient.account.findFirst({
			where: { id: oAuthAccount.accountId },
		});
		if (!user) {
			return {
				error: true,
			};
		}
		return { error: false, user };
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

	let decodedPayload: OauthUser | null | undefined;

	if (provider === 'facebook') {
		decodedPayload = await verifyFacebookOauthToken(idToken);
	} else if (provider === 'google') {
		decodedPayload = await verifyGoogleOauthToken(idToken);
	} else if (provider === 'github') {
		decodedPayload = await verifyGithubOauthToken(idToken);
	}

	if (!decodedPayload) {
		await routeRateLimiter.consume(req.ip, 2);
		return cb(
			new BadRequestError('Could not login or create account from provider')
		);
	}

	const result = await upsertOauthAccount(req, provider, decodedPayload);
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
