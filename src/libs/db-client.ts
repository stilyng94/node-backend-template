import { PrismaClient } from '@prisma/client';
import constants from '../resources/constants';

const dbClient = new PrismaClient({
	errorFormat: constants.isProduction ? 'colorless' : 'pretty',
	log: [
		{
			emit: 'stdout',
			level: constants.isProduction ? 'error' : 'query',
		},
	],
});

export default dbClient;
