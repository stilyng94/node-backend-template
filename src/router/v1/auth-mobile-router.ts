import express from 'express';
import authMobileController from '../../controller/v1/auth-mobile-controller';
import jwtMiddleware from '../../middleware/jwt-middleware';
import rateLimiterMiddleware from '../../middleware/rate-limiter-middleware';
import validateRequestMiddleWare from '../../middleware/validate-request-middleware';
import authValidator from '../../validators/auth-validator';

const authMobileRouter = express.Router();

authMobileRouter.post(
	'/oauth',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	jwtMiddleware.accessTokenMiddleware,
	authValidator.mobileAuthValidator,
	validateRequestMiddleWare,
	authMobileController.newOrConnectOauthAccount
);

export default authMobileRouter;
