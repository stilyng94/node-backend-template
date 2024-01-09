import { createTerminus } from '@godaddy/terminus';
import redisClient from '@/libs/redis-client';
import dbClient from '@/libs/db-client';
import queue from '@/libs/queue';
import initializeSocketIo from '@/libs/initializeSocketIo';
import logger from '@/libs/logger';
import config from '@/config';
import server from '@/server';
import jobHelpers from './helpers/job-helpers';
// import meilisearchCLient from './libs/meilisearch-client';
import opensearchClient from './libs/opensearch-client';

const port = config.PORT;

async function onSignal() {
	// eslint-disable-next-line no-console
	console.warn('server cleanup started!!');
	return Promise.all([
		redisClient.quit(),
		dbClient.$disconnect(),
		opensearchClient.close(),
		queue.close(),
	]);
}

async function healthCheck() {
	return Promise.all([
		redisClient.ping(),
		dbClient.$executeRaw`SELECT 1`,
		opensearchClient.ping(),
		// meilisearchCLient.isHealthy(),
	]);
}

const main = async () => {
	try {
		if (config.CRON_JOB) await jobHelpers.validateAndIndexJobs();
		await redisClient.connect();
		await dbClient.$connect();
		const io = initializeSocketIo(server);

		createTerminus(server, {
			logger: (msg, err) => logger.error(err, msg),
			signals: ['SIGINT', 'SIGTERM'],
			healthChecks: { '/health-check': healthCheck },
			onSignal: async () => {
				io.disconnectSockets(true);
				await onSignal();
			},
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
	await opensearchClient.close();
	process.exitCode = 1;
});
process.on('unhandledRejection', async (error) => {
	logger.error(error, `Unhandled rejection: ${(error as Error)?.message}`);
});

main();
