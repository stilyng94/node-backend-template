// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import dbClient from '../libs/db-client';
import logger from '../libs/logger';
import redisClient from '../libs/redis-client';
import app from '../app';

const testServer = request(app);

const clearDB = async () => {
	const tablenames = await dbClient.$queryRaw<
		Array<{ tablename: string }>
	>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

	const tables = tablenames
		.map(({ tablename }) => tablename)
		.filter((name) => name !== '_prisma_migrations')
		.map((name) => `"public"."${name}"`)
		.join(', ');

	try {
		await dbClient.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
	} catch (error) {
		logger.error(error, 'Primsa truncate error');
	}
};

beforeAll(async () => {
	await redisClient.connect();
	await dbClient.$connect();
	await clearDB();
	logger.info('Testing setting up .....');
});

afterAll(async () => {
	await redisClient.quit();
	await clearDB();
	await dbClient.$disconnect();
	logger.info('Testing done .....');
	// eslint-disable-next-line no-promise-executor-return
	await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
	process.exit(0);
});

const testLogin = async () => {
	const [email, password] = ['test@test.com', 'password'];

	const response = await testServer
		.post('/api/v1/auth/login')
		.send({ email, password });

	const cookie = response.get('Set-Cookie');
	return cookie;
};

export default { testServer, testLogin };
