import express from 'express';
import passport from 'passport';
import authController from '../../controller/v1/auth-controller';
import authMiddleware from '../../middleware/auth-middleware';
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
	passport.authenticate('local', { session: true }),
	authController.loginHandler
);

authRouter.post(
	'/change-password',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	passport.session(),
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
	passport.session(),
	passport.authenticate('facebook', { session: true }),
	authController.oAuthHandler
);

authRouter.get(
	'/google-auth',
	rateLimiterMiddleware.IpLimiterMiddleware,
	passport.authenticate('google')
);

authRouter.get(
	'/google-auth/callback',
	passport.session(),
	passport.authenticate('google', { session: true }),
	authController.oAuthHandler
);

authRouter.get(
	'/connect/google',
	passport.session(),
	authMiddleware,
	passport.authorize('google', { session: true })
);
authRouter.get(
	'/connect/facebook',
	passport.session(),
	authMiddleware,
	passport.authorize('facebook', { session: true })
);
authRouter.post(
	'/connect/local',
	passport.session(),
	authMiddleware,
	authValidator.newAccountValidator,
	validateRequestMiddleWare,
	passport.authenticate('local', { session: true }),
	authController.oAuthHandler
);

authRouter.delete(
	'/unlink',
	passport.session(),
	authMiddleware,
	authController.unlinkAccount
);

authRouter.all('/logout', authController.logout);

export default authRouter;
