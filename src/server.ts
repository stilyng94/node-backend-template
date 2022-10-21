import http from 'http';
import app from './app';
import logger from './libs/logger';

const server = http.createServer(app);

const port = parseInt(process.env.PORT ?? '5000', 10);

server.on('listening', () => logger.info({}, `App started on port ${port}`));

server.on('error', (error) => {
	switch ((error as NodeJS.ErrnoException).code) {
		case 'EACCES':
			logger.error(`${port} requires elevated privileges`);
			logger.error(error);
		// eslint-disable-next-line no-fallthrough
		case 'EADDRINUSE':
			logger.error(`${port} is already in use`);
			break;
		default:
			logger.error(error);
	}
});
export default server;
