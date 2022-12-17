import { Worker } from 'bullmq';
import path from 'path';
import config from './config';
import logger from './libs/logger';
import constants from './resources/constants';

const processorFile = constants.isProduction
	? path.join(__dirname, 'helpers', 'worker-processor.js')
	: path.join(__dirname, 'helpers', 'worker-processor.ts');

const worker = new Worker('demo', processorFile, {
	concurrency: 5,
	connection: {
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
		lazyConnect: true,
		password: config.REDIS_PASSWORD,
		username: config.REDIS_USERNAME,
		enableOfflineQueue: false,
	},
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received: closing queues');
	await worker.close();
	logger.info('All closed');
});

process.on('SIGBREAK', async () => {
	logger.info('SIGBREAK signal received: closing queues');
	await worker.close();
	logger.info('All closed');
});
process.on('SIGHUP', async () => {
	logger.info('SIGHUP signal received: closing queues');
	await worker.close();
	logger.info('All closed');
});
process.on('SIGINT', async () => {
	logger.info('SIGINT signal received: closing queues');
	await worker.close();
	logger.info('All closed');
});
