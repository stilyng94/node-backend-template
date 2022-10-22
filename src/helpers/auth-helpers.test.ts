import crypto from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import authHelpers from './auth-helpers';

describe('Test password reset', () => {
	const userId = '123456';
	const randomToken = crypto.randomBytes(32).toString('hex');

	test('should pass', async () => {
		const resetPasswordUrl = await authHelpers.generateResetPasswordUrl(userId);

		const token = resetPasswordUrl.split('/').at(-1) ?? '';

		const resetUserId = await authHelpers.decodeResetPassword(token);
		expect(resetUserId).toBe(userId);
	});

	test('should fail', async () => {
		await authHelpers.generateResetPasswordUrl(userId);

		expect(async () => authHelpers.decodeResetPassword(randomToken)).toThrow(
			BadRequestError
		);
	});
});
