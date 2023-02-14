/* eslint-disable no-console */
import { SandboxedJob } from 'bullmq';
import logger from '@/libs/logger';
import path from 'path';
import fs from 'fs';

export default async (job: SandboxedJob) => {
	const isCron = !!job.repeatJobKey;

	if (!isCron) {
		switch (job.name) {
			case 'demo-cron':
				logger.info(`${job.name} <<>> ${job.id} <<>> ${job.timestamp}`);
				break;
			default:
				logger.error(job, `no processor for specified job ${job.name}`);
				break;
		}
		return;
	}

	let modulePath;

	if (__filename.split('.').at(-1) !== 'js') {
		modulePath = path.resolve(process.cwd(), `./src/${job.data.modulePath}.ts`);
	} else {
		modulePath = path.resolve(
			process.cwd(),
			`./dist/${job.data.modulePath}.js`
		);
	}

	let jobFunc;

	if (fs.existsSync(modulePath)) {
		jobFunc = await import(modulePath);
	}

	if (!jobFunc) return;

	jobFunc.Run(job.data.args);
};
