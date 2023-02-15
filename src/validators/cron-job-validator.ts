import cron from 'cron-validate';
import { checkSchema } from 'express-validator';
import path from 'path';
import fs from 'fs';
import BadRequestError from '@/errors/bad-request-error';

const addCronJobValidator = checkSchema(
	{
		jobData: { isObject: {} },
		jobName: {
			isString: {},
		},
		pattern: {
			optional: {},
			isString: {},
			custom: {
				options(value, { req }) {
					if (value && req.body.every) {
						throw new Error(
							'pattern and every can not be used at the same time'
						);
					}
					const cronResult = cron(value);
					if (cronResult.isError()) {
						throw new Error('pattern is not a valid cron data');
					}

					return true;
				},
			},
		},
		every: {
			optional: {},
			isNumeric: { options: { no_symbols: true }, negated: false },
			custom: {
				options(value, { req }) {
					if (value && req.body.pattern) {
						throw new Error(
							'pattern and every can not be used at the same time'
						);
					}
					return true;
				},
			},
		},
		startDate: {
			optional: {},
			isDate: {},
		},
		endDate: {
			optional: {},
			isDate: {},
		},
		delay: {
			optional: {},
			isNumeric: { options: { no_symbols: true }, negated: false },
		},
		limit: {
			optional: {},
			isNumeric: { options: { no_symbols: true }, negated: false },
		},
	},
	['body']
);

async function parseAddJobData(jobData: object, module: string) {
	let modulePath;

	if (__filename.split('.').at(-1) !== 'js') {
		modulePath = path.resolve(process.cwd(), `./src/${module}.ts`);
	} else {
		modulePath = path.resolve(process.cwd(), `./dist/${module}.js`);
	}

	let validatorFunc;

	if (fs.existsSync(modulePath)) {
		validatorFunc = await import(modulePath);
	}

	if (!validatorFunc) throw new BadRequestError(`Validator function error`);

	const parsedData = await validatorFunc.validator.parseAsync(jobData, {
		async: true,
	});
	return parsedData;
}

export default { addCronJobValidator, parseAddJobData };
