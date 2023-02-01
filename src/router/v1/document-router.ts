import express from 'express';
import authMiddleware from '@/middleware/auth-middleware';
import jwtMiddleware from '@/middleware/jwt-middleware';
import rateLimiterMiddleware from '@/middleware/rate-limiter-middleware';
import documentController from '@/controller/v1/document-controller';
import documentValidator from '@/validators/document-validator';
import validateRequestMiddleWare from '@/middleware/validate-request-middleware';

const documentRouter = express.Router();

documentRouter.get(
	'/:id',
	rateLimiterMiddleware.IpLimiterMiddleware,
	jwtMiddleware.accessTokenMiddleware,
	authMiddleware,
	documentController.getDocument
);
documentRouter.put(
	'/title',
	rateLimiterMiddleware.IpLimiterMiddleware,
	jwtMiddleware.accessTokenMiddleware,
	authMiddleware,
	documentValidator.updateDocumentTitleValidator,
	validateRequestMiddleWare,
	documentController.updateDocumentTitle
);
documentRouter.post(
	'/',
	rateLimiterMiddleware.IpLimiterMiddleware,
	jwtMiddleware.accessTokenMiddleware,
	authMiddleware,
	documentController.createDocument
);
documentRouter.get(
	'/',
	rateLimiterMiddleware.IpLimiterMiddleware,
	jwtMiddleware.accessTokenMiddleware,
	authMiddleware,
	documentController.getDocuments
);

export default documentRouter;
