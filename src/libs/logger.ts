import pino, { Logger, LoggerOptions } from 'pino';
import { createWriteStream } from 'pino-sentry';

import constants from '@/resources/constants';
import config from '@/config';

export const pinoSentryStream = createWriteStream({
	dsn: config.SENTRY_DSN,
	serverName: process.env.APP_NAME ?? 'API',
	level: 'warning',
});

export const pinoConsoleTransportConfig: LoggerOptions = {
	timestamp: true,
	transport:
		config.NODE_ENV !== 'test'
			? {
					target: 'pino-pretty',
					options: {
						colorize: true,
						destination: 2,
					},
			  }
			: undefined,
};

function prodLogger(): Logger {
	return pino({}, pinoSentryStream);
}

function devLogger(): Logger {
	return pino(pinoConsoleTransportConfig);
}

function logger(): Logger {
	return constants.isProductionSentry ? prodLogger() : devLogger();
}

export default logger();
