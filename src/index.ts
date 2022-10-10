import dotenv from 'dotenv';
import Debug from 'debug';
import server from './server';
import logger from './libs/logger';

dotenv.config();

const debug = Debug(`api:index`);

const port = parseInt(process.env.PORT ?? '5000', 10);

const main = async (): Promise<void> => {
	try {
		server.listen(port, () => debug('App started on port', port));
	} catch (error) {
		debug(error);
		logger.error(error);
	}
};

main();
