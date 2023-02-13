import express from 'express';
import cronController from '@/controller/v1/cron-controller';
import validateRequestMiddleWare from '@/middleware/validate-request-middleware';
import cronJobValidator from '@/validators/cron-job-validator';

const cronRouter = express.Router();

cronRouter.get('/jobs', cronController.getAllJobs);
cronRouter.get('/cron', cronController.getAllCrons);
cronRouter.post(
	'/cron',
	cronJobValidator.addCronJobValidator,
	validateRequestMiddleWare,
	cronController.addCron
);
cronRouter.delete('/cron', cronController.deleteCron);
cronRouter.get('/config-jobs', cronController.getConfigJobs);

cronRouter.put('/retry-job/:jobId', cronController.retryFailedJob);
cronRouter.delete('/jobs/:jobId', cronController.deleteJob);

export default cronRouter;
