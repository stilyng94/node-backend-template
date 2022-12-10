import { SandboxedJob } from 'bullmq';
import logger from '../libs/logger';

export default async (job: SandboxedJob) => {
	switch (job.name) {
		case 'demo-cron':
			logger.info(`${job.name} <<>> ${job.id} <<>> ${job.timestamp}`);
			break;
		default:
			logger.error(job, `no processor for specified job ${job.name}`);
			break;
	}
};
