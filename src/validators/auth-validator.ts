import { checkSchema } from 'express-validator';

const newAccountValidator = checkSchema(
	{
		email: {
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
			isEmail: {},
			normalizeEmail: { options: { all_lowercase: true } },
		},
		password: {
			notEmpty: {},
		},
	},
	['body']
);

const mobileAuthValidator = checkSchema(
	{
		provider: {
			notEmpty: {},
			custom: {
				options(value) {
					if (['facebook', 'google', 'github'].includes(value)) {
						return true;
					}
					throw new Error('The provided oauth provider is not yet supported');
				},
			},
		},
		'oauthUser.email': {
			isEmail: {},
			normalizeEmail: { options: { all_lowercase: true } },
		},
		'oauthUser.id': {
			isString: {},
		},
		'oauthUser.name': {
			optional: {},
			isString: {},
		},
		'oauthUser.username': {
			optional: {},
			isString: {},
		},
		'oauthUser.firstName': {
			optional: {},
			isString: {},
		},
		'oauthUser.lastName': {
			optional: {},
			isString: {},
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
	mobileAuthValidator,
};
