import express from 'express';
import passport from 'passport';
import config from '../../config';
import authController from '../../controller/v1/auth-controller';
import authMiddleware from '../../middleware/auth-middleware';
import jwtMiddleware from '../../middleware/jwt-middleware';
import rateLimiterMiddleware from '../../middleware/rate-limiter-middleware';
import validateRequestMiddleWare from '../../middleware/validate-request-middleware';
import authValidator from '../../validators/auth-validator';

const authRouter = express.Router();

authRouter.post(
	'/signup',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	authValidator.newAccountValidator,
	validateRequestMiddleWare,
	authController.newAccount
);

authRouter.post(
	'/login',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	authValidator.loginValidator,
	validateRequestMiddleWare,
	passport.authenticate('local', {
		session: !!config.USE_SESSION,
	}),
	authController.loginHandler
);

authRouter.post(
	'/change-password',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	authMiddleware,
	authValidator.changePasswordValidator,
	validateRequestMiddleWare,
	authController.changePassword
);

authRouter.post(
	'/password-reset',
	rateLimiterMiddleware.IpLimiterMiddleware,
	authValidator.beginPasswordRecoveryValidator,
	validateRequestMiddleWare,
	authController.beginPasswordRecovery
);

authRouter.post(
	'/submit-password-reset',
	rateLimiterMiddleware.IpLimiterMiddleware,
	authValidator.submitPasswordRecoveryValidator,
	validateRequestMiddleWare,
	authController.submitPasswordRecovery
);

authRouter.get(
	'/facebook-auth',
	rateLimiterMiddleware.IpLimiterMiddleware,
	passport.authenticate('facebook')
);

authRouter.get(
	'/facebook-auth/callback',
	passport.authenticate('facebook', {
		session: !!config.USE_SESSION,
	}),
	authController.loginHandler
);

authRouter.get(
	'/google-auth',
	rateLimiterMiddleware.IpLimiterMiddleware,
	passport.authenticate('google')
);

authRouter.get(
	'/google-auth/callback',
	passport.authenticate('google', {
		session: !!config.USE_SESSION,
	}),
	authController.loginHandler
);

authRouter.get(
	'/connect/google',
	authMiddleware,
	passport.authorize('google', {
		session: !!config.USE_SESSION,
	})
);
authRouter.get(
	'/connect/facebook',
	authMiddleware,
	passport.authorize('facebook', {
		session: !!config.USE_SESSION,
	})
);
authRouter.post(
	'/connect/local',
	authMiddleware,
	authValidator.newAccountValidator,
	validateRequestMiddleWare,
	passport.authenticate('local', {
		session: !!config.USE_SESSION,
	}),
	authController.loginHandler
);

authRouter.delete('/unlink', authMiddleware, authController.unlinkAccount);

authRouter.post('/logout', authController.logout);
authRouter.post('/logout-all', authController.logoutAllSessions);
authRouter.post('/refresh-token', authController.refreshTokenHandler);

authRouter.all(
	'/secure',
	jwtMiddleware.accessTokenMiddleware,
	authMiddleware,
	(_, res) => {
		return res.sendStatus(200);
	}
);

export default authRouter;
