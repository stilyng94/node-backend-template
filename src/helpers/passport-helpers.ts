import { Application, Request } from 'express';
import passport from 'passport';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import routeRateLimiter from '@/libs/rate-limit';
import constants from '@/resources/constants';
import NotAuthenticatedError from '@/errors/not-authenticated-error';
import authHelpers from '@/helpers/auth-helpers';
import config from '@/config';

const facebookOAuth2Strategy = new OAuth2Strategy(
	{
		state: true, // only use when using session.
		authorizationURL: constants.urls.facebookAuthorizationURL,
		tokenURL: constants.urls.facebookTokenURL,
		clientID: config.FACEBOOK_CLIENT_ID,
		clientSecret: config.FACEBOOK_CLIENT_SECRET,
		scope: ['email', 'public_profile'],
		callbackURL: `${config.BASE_URL}/api/v1/auth/facebook-auth/callback`,
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
		clientID: config.GOOGLE_CLIENT_ID,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
		scope: ['email', 'profile'],
		callbackURL: `${config.BASE_URL}/api/v1/auth/google-auth/callback`,
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

const githubOAuth2Strategy = new OAuth2Strategy(
	{
		state: true, // only use when using session.
		authorizationURL: constants.urls.githubAuthorizationURL,
		tokenURL: constants.urls.githubTokenURL,
		clientID: config.GITHUB_CLIENT_ID,
		clientSecret: config.GITHUB_CLIENT_SECRET,
		scope: ['user:email'],
		callbackURL: `${config.BASE_URL}/api/v1/auth/github-auth/callback`,
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
		return authHelpers.oauthStrategyVerifyHandler(req, 'github', params, cb);
	}
);

const localStrategy = new LocalStrategy(
	{ passReqToCallback: true, usernameField: 'email' },
	async (req, email, password, cb) => {
		const { userNameIpKey } = req;

		const resUsernameAndIP = await routeRateLimiter.get(userNameIpKey!);

		if (!req.user?.id) {
			const loginResult = await authHelpers.loginUser(email, password);

			if (loginResult.error) {
				await routeRateLimiter.consume(userNameIpKey!);
				return cb(new NotAuthenticatedError(loginResult.errorMessage));
			}
			if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
				await routeRateLimiter.delete(userNameIpKey!);
			}

			return cb(null, { id: loginResult.user?.id });
		}
		// linking
		await authHelpers.createUser(email, password, req.user.id);
		return cb(null, req.user);
	}
);

const initializePassport = (app: Application) => {
	app.use(passport.initialize());
	if (config.USE_SESSION) {
		app.use(passport.session());

		passport.serializeUser((user, cb) => {
			return cb(null, {
				id: user.id,
			});
		});
		passport.deserializeUser((user, cb) => {
			if (user) {
				return cb(null, user as Express.User);
			}
			return cb(new NotAuthenticatedError());
		});
	}

	passport.use('facebook', facebookOAuth2Strategy);
	passport.use('local', localStrategy);
	passport.use('google', googleOAuth2Strategy);
	passport.use('github', githubOAuth2Strategy);
};

export default { initializePassport };
