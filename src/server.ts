import http from 'http';
import logger from '@/libs/logger';
import app from '@/app';
import config from '@/config';

const server = http.createServer(app);

const port = config.PORT;

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
server.setTimeout(5000);
export default server;
