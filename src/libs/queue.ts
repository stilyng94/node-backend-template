import { Queue } from 'bullmq';
import config from '../config';

const queue = new Queue('demo', {
	defaultJobOptions: { removeOnComplete: { count: 10 } },
	connection: {
		host: config.REDIS_HOST,
		port: config.REDIS_PORT,
		lazyConnect: true,
		password: config.REDIS_PASSWORD,
		username: config.REDIS_USERNAME,
		enableOfflineQueue: false,
	},
});

export default queue;
