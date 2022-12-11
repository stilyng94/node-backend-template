import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';

const createAUthToken = (userId: string) => {
	const secret = Buffer.from(process.env.SECRET!);

	const token = jsonwebtoken.sign({ userId }, secret, {
		algorithm: 'HS256',
		expiresIn: 60 * 30, // 30mins
	});
	return token;
};

const verifyAUthToken = (token: string) => {
	try {
		const secret = Buffer.from(process.env.SECRET!);

		const payload = jsonwebtoken.verify(token, secret, {
			algorithms: ['HS256'],
			ignoreExpiration: false,
			ignoreNotBefore: false,
		}) as JwtPayload;

		return payload.userId;
	} catch (error) {
		return null;
	}
};

export default { createAUthToken, verifyAUthToken };
