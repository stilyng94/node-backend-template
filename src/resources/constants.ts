import dotenv from 'dotenv';

dotenv.config();

export default {
	resetPasswordUrl: 'reset-password',
	prefix: {
		prefixResetPassword: 'resetPassword_',
	},
	urls: {
		facebookJwkUrl: 'https://web.facebook.com/.well-known/oauth/openid/jwks',
		facebookAuthorizationURL: 'https://www.facebook.com/v15.0/dialog/oauth',
		facebookTokenURL: 'https://graph.facebook.com/v15.0/oauth/access_token',
		googleAuthorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
		googleTokenURL: 'https://oauth2.googleapis.com/token',
		githubAuthorizationURL: 'https://github.com/login/oauth/authorize',
		githubTokenURL: 'https://github.com/login/oauth/access_token',
	},
	isProduction: ['production', 'staging'].includes(process.env.NODE_ENV ?? ''),
	isProductionSentry: ['production', 'staging'].includes(
		process.env.SENTRY_ENVIRONMENT ?? ''
	),
};
