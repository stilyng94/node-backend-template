import pino, { Logger } from 'pino';
import { createWriteStream } from 'pino-sentry';

import dotenv from 'dotenv';

dotenv.config();

function prodLogger(): Logger {
	const stream = createWriteStream({
		dsn: process.env.SENTRY_DSN,
		serverName: process.env.APP_NAME ?? 'API',
		level: 'warning',
	});

	return pino({}, stream);
}

function devLogger(): Logger {
	return pino({
		timestamp: true,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				destination: 2,
				sync: process.env.SENTRY_ENVIRONMENT === 'testing',
			},
		},
	});
}

function logger(): Logger {
	return ['production', 'staging'].includes(
		process.env.SENTRY_ENVIRONMENT ?? ''
	)
		? prodLogger()
		: devLogger();
}

export default logger();
