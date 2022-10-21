import dotenv from 'dotenv';
import logger from '../libs/logger';
import redisClient from '../libs/redis-client';

beforeAll(async () => {
	dotenv.config();

	await redisClient.connect();
	logger.info('Testing setting up .....');
});

afterAll(async () => {
	await redisClient.quit();
	logger.info('Testing done .....');
});
