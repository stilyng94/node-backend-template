import { Worker } from 'bullmq';
import path from 'path';
import logger from '@/libs/logger';
import config from '@/config';

const processorFile =
	__filename.split('.').at(-1) === 'js'
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

async function closeWorker() {
	logger.info('closing queues');
	await worker.close();
	logger.info('worker closed');
}

process.on('SIGTERM', async () => {
	await closeWorker();
});
process.on('SIGINT', async () => {
	await closeWorker();
});
