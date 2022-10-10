import pino, { Logger } from 'pino';

function prodLogger(): Logger {
	return pino({
		transport: {
			target: 'pino-sentry-transport',
			options: {
				sentry: {
					dsn: process.env.SENTRY_DSN,
				},
				withLogRecord: true,
				tags: ['id'],
				context: ['hostname'],
				minLevel: 40,
			},
		},
	});
}

function devLogger(): Logger {
	return pino({
		timestamp: true,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				destination: 2,
				sync: process.env.NODE_ENV === 'testing',
			},
		},
	});
}

function logger(): Logger {
	return ['production', 'staging'].includes(process.env.NODE_ENV ?? '')
		? prodLogger()
		: devLogger();
}

export default logger();
