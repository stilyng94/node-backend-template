import { Application, Request } from 'express';
import passport from 'passport';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import NotAuthorizedError from '../errors/not-authorized-error';
import logger from '../libs/logger';
import authHelpers from './auth-helpers';
import routeRateLimiter from '../libs/rate-limit';
import BadRequestError from '../errors/bad-request-error';

const facebookOAuth2Strategy = new OAuth2Strategy(
	{
		authorizationURL: 'https://www.example.com/oauth2/authorize',
		tokenURL: 'https://www.example.com/oauth2/token',
		clientID: process.env.FACEBOOK_CLIENT_ID ?? 'clientId',
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? 'clientSecret',
		scope: ['email', 'profile'],
		callbackURL: 'http://localhost:3000/api/v1/auth/facebook-auth/callback',
		passReqToCallback: true,
	},
	async (
		req: Request,
		accessToken: string,
		refreshToken: string,
		profile: unknown,
		cb: VerifyCallback
	) => {
		const resIP = await routeRateLimiter.get(req.ip);
		if (!profile) {
			await routeRateLimiter.consume(req.ip, 2);
			return cb(
				new BadRequestError('Could not login or create account from provider')
			);
		}
		if (resIP !== null && resIP.consumedPoints > 0) {
			await routeRateLimiter.delete(req.ip);
		}
		logger.info(profile, 'profile');
		return cb(null);
	}
);

const localStrategy = new LocalStrategy(
	{ passReqToCallback: true, usernameField: 'email' },
	async (req, email, password, cb) => {
		const { userNameIpKey } = req;

		const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey!);
		const loginResult = await authHelpers.loginUser(email, password);

		if (loginResult.error) {
			await routeRateLimiter.consume(userNameIpKey!);
			return cb(new NotAuthorizedError(loginResult.errorMessage));
		}
		if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
			await routeRateLimiter.delete(userNameIpKey!);
		}

		return cb(null, loginResult.user);
	}
);

const initializePassport = (app: Application) => {
	app.use(passport.initialize());

	passport.serializeUser((user, cb) => {
		return cb(null, {
			email: user.email,
			id: user.id,
			isActive: user.isActive,
		});
	});
	passport.deserializeUser((user, cb) => {
		if (user) {
			return cb(null, user as Express.User);
		}
		return cb(new NotAuthorizedError());
	});
	passport.use('facebook', facebookOAuth2Strategy);
	passport.use('local', localStrategy);
};

export default { initializePassport };
