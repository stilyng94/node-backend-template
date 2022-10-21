import crypto from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import passwordResetHelper from './password-reset-helper';

describe('Test password reset', () => {
	const userId = '123456';
	const randomToken = crypto.randomBytes(32).toString('hex');

	test('should pass', async () => {
		const resetPasswordUrl = await passwordResetHelper.generateResetPasswordUrl(
			userId
		);

		const token = resetPasswordUrl.split('/').at(-1) ?? '';

		const resetUserId = await passwordResetHelper.decodeResetPassword(token);
		expect(resetUserId).toBe(userId);
	});

	test('should fail', async () => {
		await passwordResetHelper.generateResetPasswordUrl(userId);

		expect(async () =>
			passwordResetHelper.decodeResetPassword(randomToken)
		).toThrow(BadRequestError);
	});
});
