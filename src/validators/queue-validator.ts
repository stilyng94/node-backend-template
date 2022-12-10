import cron from 'cron-validate';
import { checkSchema } from 'express-validator';
import jsonJobs from '../resources/job.json';

const addCronJobValidator = checkSchema(
	{
		jobData: {
			optional: {},
			isObject: {},
		},
		jobId: {
			optional: {},
			isString: {},
		},
		jobName: {
			notEmpty: {},
			isString: {},
			custom: {
				options(value) {
					const exists = jsonJobs.find((job) => job.name === value);
					if (exists) {
						return true;
					}
					throw new Error(
						`job with name ${value} not configured yet. Please add to job.json and the required processor`
					);
				},
			},
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

export default { addCronJobValidator };
