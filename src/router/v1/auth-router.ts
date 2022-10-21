import express from 'express';
import authController from '../../controller/v1/auth-controller';
import deviceInfoMiddleware from '../../middleware/device-info-middleware';
import rateLimiterMiddleware from '../../middleware/rate-limiter-middleware';

const authRouter = express.Router();

authRouter.get(
	'/login',
	deviceInfoMiddleware,
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	authController.login
);

export default authRouter;
