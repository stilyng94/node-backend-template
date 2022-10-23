import { checkSchema } from 'express-validator';

const newAccountValidator = checkSchema(
	{
		email: {
			notEmpty: {},
			isEmail: {},
			normalizeEmail: { options: { all_lowercase: true } },
		},
		password: {
			isLength: { options: { max: 64, min: 8 } }, // Password length 8>=and <=64 according to OWASP

			isStrongPassword: { options: { minLength: 8 } },
		},
	},
	['body']
);

const changePasswordValidator = checkSchema({
	newPassword: {
		isLength: { options: { max: 64, min: 8 } }, // Password length 8>=and <=64 according to OWASP

		isStrongPassword: { options: { minLength: 8 } },
	},
	passwordConfirmation: {
		custom: {
			options(value, { req }) {
				if (req.body.newPassword === value) {
					return true;
				}
				throw new Error('passwords do not match');
			},
		},
	},
	currentPassword: {
		notEmpty: {},
		custom: {
			options(value, { req }) {
				if (req.body.newPassword !== value) {
					return true;
				}
				throw new Error('current password should not be same as new password');
			},
		},
	},
});

const beginPasswordRecoveryValidator = checkSchema(
	{
		email: {
			notEmpty: {},
			isEmail: {},
			normalizeEmail: { options: { all_lowercase: true } },
		},
	},
	['body']
);

const submitPasswordRecoveryValidator = checkSchema(
	{
		token: {
			notEmpty: {},
		},
		password: {
			isLength: { options: { max: 64, min: 8 } }, // Password length 8>=and <=64 according to OWASP

			isStrongPassword: { options: { minLength: 8 } },
		},
	},
	['body']
);

const loginValidator = checkSchema(
	{
		email: {
			notEmpty: {},
			isEmail: {},
			normalizeEmail: { options: { all_lowercase: true } },
		},
		password: {
			notEmpty: {},
		},
	},
	['body']
);
export default {
	newAccountValidator,
	changePasswordValidator,
	beginPasswordRecoveryValidator,
	submitPasswordRecoveryValidator,
	loginValidator,
};
