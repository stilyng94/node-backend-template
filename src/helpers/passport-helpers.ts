import { Application, Request } from 'express';
import passport from 'passport';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import NotAuthorizedError from '../errors/not-authorized-error';
import authHelpers from './auth-helpers';
import routeRateLimiter from '../libs/rate-limit';
import constants from '../resources/constants';

const facebookOAuth2Strategy = new OAuth2Strategy(
	{
		state: true, // only use when using session.
		authorizationURL: constants.urls.facebookAuthorizationURL,
		tokenURL: constants.urls.facebookTokenURL,
		clientID: process.env.FACEBOOK_CLIENT_ID ?? 'clientId',
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? 'clientSecret',
		scope: ['email', 'public_profile'],
		callbackURL: `${process.env.BASE_URL}/v1/auth/facebook-auth/callback`,
		passReqToCallback: true,
	},
	async (
		req: Request,
		_: string,
		__: string,
		params: Record<string, string | Array<string>>,
		___: Record<string, string | Array<string>>,
		cb: VerifyCallback
	) => {
		return authHelpers.oauthStrategyVerifyHandler(req, 'facebook', params, cb);
	}
);

const googleOAuth2Strategy = new OAuth2Strategy(
	{
		state: true, // only use when using session.
		authorizationURL: constants.urls.googleAuthorizationURL,
		tokenURL: constants.urls.googleTokenURL,
		clientID: process.env.GOOGLE_CLIENT_ID ?? 'clientId',
		clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'clientSecret',
		scope: ['email', 'profile'],
		callbackURL: `${process.env.BASE_URL}/v1/auth/google-auth/callback`,
		passReqToCallback: true,
	},
	async (
		req: Request,
		_: string,
		__: string,
		params: Record<string, string | Array<string>>,
		___: Record<string, string | Array<string>>,
		cb: VerifyCallback
	) => {
		return authHelpers.oauthStrategyVerifyHandler(req, 'google', params, cb);
	}
);

const localStrategy = new LocalStrategy(
	{ passReqToCallback: true, usernameField: 'email' },
	async (req, email, password, cb) => {
		const { userNameIpKey } = req;

		const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey!);

		if (!req.user) {
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
		// linking
		await authHelpers.createUser(email, password, req.user.id);
		return cb(null, req.user);
	}
);

const initializePassport = (app: Application) => {
	app.use(passport.initialize());

	passport.serializeUser((user, cb) => {
		return cb(null, {
			id: user.id,
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
	passport.use('google', googleOAuth2Strategy);
};

export default { initializePassport };
