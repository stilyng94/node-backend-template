import dotenv from 'dotenv';
import { createTerminus } from '@godaddy/terminus';
import server from './server';
import logger from './libs/logger';
import redisClient from './libs/redis-client';
import dbClient from './libs/db-client';

dotenv.config();

const port = parseInt(process.env.PORT ?? '5000', 10);

async function onSignal() {
	logger.warn({}, 'server cleanup started!!');
	return Promise.all([redisClient.quit(), dbClient.$disconnect()]);
}

async function healthCheck() {
	return Promise.all([redisClient.ping(), dbClient.$executeRaw`SELECT 1`]);
}

const main = async () => {
	try {
		await redisClient.connect();
		await dbClient.$connect();
		createTerminus(server, {
			logger: (msg, err) => logger.error(err, msg),
			signals: ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM'],
			healthChecks: { '/health-check': healthCheck },
			onShutdown: async () =>
				logger.warn({}, 'cleanup finished, server is shutting down'),
			onSignal,
		}).listen(port);
	} catch (error) {
		logger.error(error);
	}
};

process.on('uncaughtException', async (error) => {
	logger.error(error);
	await redisClient.quit();
	await dbClient.$disconnect();
	process.exit(1);
});

main();
