import { createTerminus } from '@godaddy/terminus';
import server from './server';
import logger from './libs/logger';
import redisClient from './libs/redis-client';
import dbClient from './libs/db-client';
import queue from './libs/queue';
import config from './config';

const port = config.PORT;

async function onSignal() {
	// eslint-disable-next-line no-console
	console.warn('server cleanup started!!');
	return Promise.all([
		redisClient.quit(),
		dbClient.$disconnect(),
		queue.close(),
	]);
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
				// eslint-disable-next-line no-console
				console.warn('cleanup finished, server is shutting down'),
			onSignal,
		}).listen(port);
	} catch (error) {
		logger.error(error);
	}
};

process.on('uncaughtException', async (error) => {
	logger.error(error, `Uncaught Exception: ${error?.message}`);
	await redisClient.quit();
	await dbClient.$disconnect();
	await queue.close();
	process.exit(1);
});
process.on('unhandledRejection', async (error) => {
	logger.error(error, `Unhandled rejection: ${(error as Error)?.message}`);
});

main();
