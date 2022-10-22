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

export default { newAccountValidator };
