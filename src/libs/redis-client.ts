import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const redisClient = createClient({
	url: process.env.REDIS_URL,
	legacyMode: true,
});

redisClient.on('connect', () => logger.info({}, 'redis client ready'));

redisClient.on('error', (error) => {
	logger.error(error);
});

export default redisClient;
