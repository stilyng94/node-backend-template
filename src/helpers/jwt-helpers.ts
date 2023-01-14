import { Request } from 'express';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import redisClient from '../libs/redis-client';
import cryptoUtils from '../utils/crypto-utils';

type CustomPayloadType = Record<string, unknown>;
interface VerifyTokenArg {
	token: string;
	ignoreExpiration?: boolean;
	ignoreRedis?: boolean;
}

const secretFromBuffer = (key: string) => {
	return Buffer.from(key, 'hex');
};

const getTokenFromHeader = (req: Request) => {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return null;
	}

	const [bearer, token] = authorizationHeader.split(' ');
	if (!token || bearer !== 'Bearer') {
		return null;
	}
	return token;
};

const generateAccessToken = async (
	payload: CustomPayloadType,
	refreshTokenId: string
) => {
	const secret = secretFromBuffer(config.ACCESS_TOKEN_SECRET);
	const jwtid = (await cryptoUtils.asyncRandomBytes(32)).toString('hex');

	const token = jsonwebtoken.sign({ ...payload, refreshTokenId }, secret, {
		jwtid,
		algorithm: 'HS256',
		expiresIn: config.ACCESS_TOKEN_EXP,
		issuer: 'api.node-template.com',
		audience: ['node-template.com'],
	});

	// Save to redis
	await redisClient.setex(
		`accessToken:${payload.userId}:${jwtid}`,
		config.ACCESS_TOKEN_EXP,
		1
	);
	return token;
};

const verifyAccessToken = async (verifyTokenArg: VerifyTokenArg) => {
	try {
		const secret = secretFromBuffer(config.ACCESS_TOKEN_SECRET);

		const payload = jsonwebtoken.verify(verifyTokenArg.token, secret, {
			ignoreExpiration: verifyTokenArg.ignoreExpiration,
			algorithms: ['HS256'],
			issuer: 'api.node-template.com',
			audience: ['node-template.com'],
		}) as JwtPayload;

		if (!verifyTokenArg.ignoreRedis) {
			// verify from redis
			const valid = await redisClient.get(
				`accessToken:${payload.userId}:${payload.jti}`
			);

			if (!valid) {
				return null;
			}
		}

		return payload;
	} catch (error) {
		return null;
	}
};

const generateRefreshToken = async (payload: CustomPayloadType) => {
	const secret = secretFromBuffer(config.REFRESH_TOKEN_SECRET);
	const jwtid = (await cryptoUtils.asyncRandomBytes(32)).toString('hex');

	const token = jsonwebtoken.sign(payload, secret, {
		jwtid,
		algorithm: 'HS256',
		expiresIn: config.REFRESH_TOKEN_EXP,
		issuer: 'api.node-template.com',
		audience: ['node-template.com'],
	});
	// Save to redis
	await redisClient.setex(
		`refreshToken:${payload.userId}:${jwtid}`,
		config.REFRESH_TOKEN_EXP,
		1
	);
	return { token, jwtid };
};

const verifyRefreshToken = async (verifyTokenArg: VerifyTokenArg) => {
	try {
		const secret = secretFromBuffer(config.REFRESH_TOKEN_SECRET);

		const payload = jsonwebtoken.verify(verifyTokenArg.token, secret, {
			ignoreExpiration: verifyTokenArg.ignoreExpiration,
			algorithms: ['HS256'],
			issuer: 'api.node-template.com',
			audience: ['node-template.com'],
		}) as JwtPayload;

		if (!verifyTokenArg.ignoreRedis) {
			// verify from redis
			const valid = await redisClient.get(
				`refreshToken:${payload.userId}:${payload.jti}`
			);
			if (!valid) {
				return null;
			}
		}

		return payload;
	} catch (error) {
		return null;
	}
};

const generateAuthTokens = async (payload: CustomPayloadType) => {
	const refreshToken = await generateRefreshToken(payload);
	const accessToken = await generateAccessToken(payload, refreshToken.jwtid);

	return { accessToken, refreshToken: refreshToken.token };
};

const refreshAccessToken = async (req: Request) => {
	const { refreshToken } = req.body;
	const accessToken = getTokenFromHeader(req);

	if (!accessToken || !refreshToken) {
		return null;
	}

	const payload = await verifyRefreshToken({ token: refreshToken });
	if (!payload) {
		return null;
	}
	const accessTokenPayload = await verifyAccessToken({
		token: accessToken,
		ignoreExpiration: true,
		ignoreRedis: true,
	});
	if (
		!accessTokenPayload ||
		accessTokenPayload.refreshTokenId !== payload.jti
	) {
		return null;
	}
	const newAccessToken = generateAccessToken(
		{ userId: payload.userId },
		payload.jti!
	);
	return newAccessToken;
};

const clearAllSessions = (userId?: string) => {
	// Create a readable stream (object mode)
	const accessTokenStream = redisClient.scanStream({
		match: `accessToken:${userId}:*`,
	});
	accessTokenStream.on('data', (keys) => {
		if (keys.length) {
			const pipeline = redisClient.pipeline();
			keys.forEach((key: string) => {
				pipeline.del(key);
			});
			pipeline.exec();
		}
	});

	const refreshTokenStream = redisClient.scanStream({
		match: `refreshToken:${userId}:*`,
	});
	refreshTokenStream.on('data', (keys) => {
		if (keys.length) {
			const pipeline = redisClient.pipeline();
			keys.forEach((key: string) => {
				pipeline.del(key);
			});
			pipeline.exec();
		}
	});
};

const clearCurrentSession = async (
	userId: string,
	refreshTokenId?: string,
	accessTokenId?: string
) => {
	await redisClient.del(`accessToken:${userId}:${accessTokenId}`);
	await redisClient.del(`refreshToken:${userId}:${refreshTokenId}`);
};

const jwtLogoutHandler = async (req: Request, clearAll?: boolean) => {
	const { refreshToken } = req.body;
	const accessToken = getTokenFromHeader(req);

	let refreshTokenPayload: jsonwebtoken.JwtPayload | null = null;
	let accessTokenPayload: jsonwebtoken.JwtPayload | null = null;

	if (refreshToken) {
		refreshTokenPayload = await verifyRefreshToken({
			token: refreshToken,
			ignoreExpiration: true,
			ignoreRedis: true,
		});
	}

	if (accessToken) {
		accessTokenPayload = await verifyAccessToken({
			token: accessToken,
			ignoreExpiration: true,
			ignoreRedis: true,
		});
	}
	if (accessTokenPayload || refreshTokenPayload) {
		const userId = accessTokenPayload?.userId ?? refreshTokenPayload?.userId;

		if (clearAll) {
			clearAllSessions(userId);
		} else {
			await clearCurrentSession(
				userId,
				refreshTokenPayload?.jti,
				accessTokenPayload?.jti
			);
		}
	}
};

export default {
	generateAccessToken,
	verifyAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	generateAuthTokens,
	refreshAccessToken,
	jwtLogoutHandler,
	getTokenFromHeader,
};
