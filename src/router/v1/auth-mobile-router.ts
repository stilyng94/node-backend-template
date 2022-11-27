import express from 'express';
import passport from 'passport';
import authMobileController from '../../controller/v1/auth-mobile-controller';
import authMiddleware from '../../middleware/auth-middleware';

const authMobileRouter = express.Router();

authMobileRouter.get('/github-auth', authMobileController.githubOauth);

authMobileRouter.get(
	'/connect/github',
	passport.session(),
	authMiddleware,
	passport.authorize('github', { session: true }),
	authMobileController.githubOauth
);

export default authMobileRouter;
