import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const redisClient = new Redis({
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
	lazyConnect: true,
	password: process.env.REDIS_PASSWORD,
	username: process.env.REDIS_USERNAME,
	enableOfflineQueue: false,
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
