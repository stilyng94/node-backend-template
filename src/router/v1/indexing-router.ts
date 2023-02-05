import express from 'express';
// import jwtMiddleware from '@/middleware/jwt-middleware';
import rateLimiterMiddleware from '@/middleware/rate-limiter-middleware';
import indexingController from '@/controller/v1/indexing-controller';

const indexingRouter = express.Router();

indexingRouter.post(
	'/create',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.createIndex
);

indexingRouter.get(
	'/index-company',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.indexDocuments
);

indexingRouter.get(
	'/search',
	rateLimiterMiddleware.userNameIpLimiterMiddleware,
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.searchDocument
);

export default indexingRouter;
