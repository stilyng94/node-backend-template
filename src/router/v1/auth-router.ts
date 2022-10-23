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
	passport.authenticate('local'),
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

authRouter.post('/logout', authController.logout);

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

authRouter.post(
	'/facebook-auth',
	rateLimiterMiddleware.IpLimiterMiddleware,
	passport.authenticate('facebook')
);

authRouter.get(
	'/facebook-auth/callback',
	passport.authenticate('facebook'),
	authController.oAuthHandler
);

export default authRouter;
