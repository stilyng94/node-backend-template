import { Queue } from 'bullmq';

const queue = new Queue('demo', {
	defaultJobOptions: { removeOnComplete: { count: 10 } },
	connection: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
		lazyConnect: true,
		password: process.env.REDIS_PASSWORD,
		username: process.env.REDIS_USERNAME,
		enableOfflineQueue: false,
	},
});

export default queue;
