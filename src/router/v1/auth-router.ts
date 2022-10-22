import express from 'express';
import authController from '../../controller/v1/auth-controller';
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
	authController.login
);

authRouter.post('/logout', authController.logout);
export default authRouter;
