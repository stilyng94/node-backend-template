import Redis from 'ioredis';
import logger from './logger';
import config from '../config';

const redisClient = new Redis({
	host: config.REDIS_HOST,
	port: config.REDIS_PORT,
	lazyConnect: true,
	password: config.REDIS_PASSWORD,
	username: config.REDIS_USERNAME,
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
