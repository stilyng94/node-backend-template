import dotenv from 'dotenv';
import Debug from 'debug';
import server from './server';
import logger from './libs/logger';
import redisClient from './libs/redis-client';

dotenv.config();

const debug = Debug(`api:index`);

const port = parseInt(process.env.PORT ?? '5000', 10);

const main = async (): Promise<void> => {
	try {
		await redisClient.connect();
		server.listen(port, () => debug('App started on port', port));
	} catch (error) {
		debug(error);
		logger.error(error);
		await redisClient.quit();
		process.exit(1);
	}
};

process.on('uncaughtException', async (error) => {
	logger.error(error);
	await redisClient.quit();
	process.exit(1);
});

main();
