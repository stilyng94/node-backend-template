import http from 'http';
import Debug from 'debug';
import app from './app';
import logger from './libs/logger';

const debug = Debug(`api:server`);

const server = http.createServer(app);

const port = parseInt(process.env.PORT ?? '5000', 10);

server.on('listening', () => debug('connection up and running'));

server.on('error', (error) => {
	switch ((error as NodeJS.ErrnoException).code) {
		case 'EACCES':
			debug(`${port} requires elevated privileges`);
			logger.error(error);
			process.exit(1);
		// eslint-disable-next-line no-fallthrough
		case 'EADDRINUSE':
			debug(`${port} is already in use`);
			server.close();
			break;
		default:
			logger.error(error);
	}
});
export default server;
