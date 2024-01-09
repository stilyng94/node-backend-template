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

indexingRouter.get(
	'/opensearch-indexes',
	// rateLimiterMiddleware.userNameIpLimiterMiddleware,
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.indexDocumentsWithOpensearch
);

indexingRouter.get(
	'/opensearch-getIndices',
	// rateLimiterMiddleware.userNameIpLimiterMiddleware,
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.getIndicesWithOpensearch
);

indexingRouter.get(
	'/opensearch-index',
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.indexDocumentWithOpensearch
);
indexingRouter.post(
	'/opensearch-create',
	// jwtMiddleware.accessTokenMiddleware,
	indexingController.createIndexWithOpensearch
);

export default indexingRouter;
