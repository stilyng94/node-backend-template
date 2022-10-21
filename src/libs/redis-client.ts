import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const redisClient = createClient({
	url: process.env.REDIS_URL,
	disableOfflineQueue: true,
	legacyMode: ['test', 'testing', 'development'].includes(
		process.env.NODE_ENV ?? ''
	),
});

redisClient.on('connect', () => logger.info({}, 'redis client connected'));
redisClient.on('ready', () => logger.info({}, 'redis client ready'));
redisClient.on('reconnecting', () =>
	logger.info({}, 'redis client reconnecting')
);
redisClient.on('error', (error) => {
	logger.error(error);
});

redisClient.on('end', () => {
	logger.info('client disconnected from redis');
});

export default redisClient;
