import dotenv from 'dotenv';
import Debug from 'debug';

const debug = Debug('api:setup-test');

beforeAll(async () => {
	dotenv.config();
	process.env.NODE_ENV = 'testing';
	debug('Testing setting up .....');
});

afterAll(() => {
	debug('Testing done .....');
});
