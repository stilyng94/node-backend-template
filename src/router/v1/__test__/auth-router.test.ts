import setupTest from '../../../test/setup-test';

describe('Test signup route', () => {
	it('response 200', async () => {
		const response = await setupTest.testServer
			.post('/api/v1/auth/signup')
			.send({
				password: 'Nkunim123#',
				email: 'mail@mail.com',
			})
			.set('Accept', 'application/json');
		expect(response.status).toEqual(200);
		expect(response.body.success).toBeTruthy();
	});

	it('response 400', async () => {
		const response = await setupTest.testServer
			.post('/api/v1/auth/signup')
			.send({
				password: 'Nkunim123#',
				email: 'mail@mail',
			})
			.set('Accept', 'application/json');
		expect(response.status).toEqual(400);
		expect(response.body.success).toBeFalsy();
	});
	it('response 500', async () => {
		const response = await setupTest.testServer
			.post('/api/v1/auth/signup')
			.send({
				password: 'Nkunim123#',
				email: 'mail@mail.com',
			})
			.set('Accept', 'application/json');
		expect(response.status).toEqual(500);
		expect(response.body.success).toBeFalsy();
	});
});
