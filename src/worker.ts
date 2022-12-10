import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import path from 'path';
import logger from './libs/logger';
import constants from './resources/constants';

dotenv.config();

const processorFile = constants.isProduction
	? path.join(__dirname, 'helpers', 'worker-processor.js')
	: path.join(__dirname, 'helpers', 'worker-processor.ts');

const worker = new Worker('demo', processorFile, {
	concurrency: 5,
	connection: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
		lazyConnect: true,
		password: process.env.REDIS_PASSWORD,
		username: process.env.REDIS_USERNAME,
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
