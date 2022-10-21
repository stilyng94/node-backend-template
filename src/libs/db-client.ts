import { PrismaClient } from '@prisma/client';

const dbClient = new PrismaClient({
	errorFormat: ['production', 'staging'].includes(process.env.NODE_ENV ?? '')
		? 'colorless'
		: 'pretty',
	log: [
		{
			emit: 'stdout',
			level: ['production', 'staging'].includes(process.env.NODE_ENV ?? '')
				? 'error'
				: 'query',
		},
	],
});

export default dbClient;
