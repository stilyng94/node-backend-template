import BadRequestError from '../../errors/bad-request-error';
import authHelpers from '../auth-helpers';

describe('Test password reset', () => {
	const userId = '123456';

	test('should pass', async () => {
		const resetPasswordUrl = await authHelpers.generateResetPasswordUrl(userId);

		const token = resetPasswordUrl.split('/').at(-1) ?? '';

		const resetUserId = await authHelpers.decodeResetPassword(token);
		expect(resetUserId).toBe(userId);
	});

	test('should fail', async () => {
		const resetPasswordUrl = await authHelpers.generateResetPasswordUrl(userId);
		const token = `${resetPasswordUrl.split('/').at(-1) ?? ''}fake-token`;

		await expect(authHelpers.decodeResetPassword(token)).rejects.toThrow(
			BadRequestError
		);
	});
});

describe('Test password hashing and verifying', () => {
	const testPassword = 'Nkunim123#';

	test('should pass verification', async () => {
		const hashedPassword = await authHelpers.hashPassword(testPassword);
		const verified = await authHelpers.verifyPassword(
			testPassword,
			hashedPassword
		);
		expect(verified).toBeTruthy();
	});

	test('should fail verification', async () => {
		const hashedPassword = await authHelpers.hashPassword(testPassword);
		const verified = await authHelpers.verifyPassword(
			`${testPassword}fake`,
			hashedPassword
		);
		expect(verified).toBeFalsy();
	});
});
