import express from 'express';
import queueController from '@/controller/v1/queue-controller';
import validateRequestMiddleWare from '@/middleware/validate-request-middleware';
import queueValidator from '@/validators/queue-validator';

const queueRouter = express.Router();

queueRouter.get('/jobs', queueController.getAllJobs);
queueRouter.get('/cron-jobs', queueController.getAllCronJobs);
queueRouter.post(
	'/cron-jobs',
	queueValidator.addCronJobValidator,
	validateRequestMiddleWare,
	queueController.addCronJob
);
queueRouter.delete('/cron-jobs', queueController.deleteCronJob);
queueRouter.get('/config-jobs', queueController.getConfigJobs);

queueRouter.put('/retry-job/:jobId', queueController.retryFailedJob);
queueRouter.delete('/jobs/:jobId', queueController.deleteJob);

export default queueRouter;
