import z from 'zod';
import fs from 'fs';
import path from 'path';
import logger from '@/libs/logger';

const jobSchemaParameter = z.object({
	'@name': z.string().trim(),
	'@type': z.enum(['string', 'number', 'date', 'boolean', 'enum']),
	'@required': z.boolean(),
	'@description': z.ostring(),
	'enum-values': z.optional(
		z.object({
			value: z
				.array(z.union([z.number(), z.string().trim(), z.date()]))
				.refine((data) => new Set(data).size === data.length),
		})
	),
	'default-value': z.optional(
		z.union([z.number(), z.string().trim(), z.date(), z.boolean()])
	),
});

const jobSchemaStatusCode = z.object({
	'@code': z.string().trim(),
	'@description': z.ostring(),
});

const jobSchemaObject = z.object({
	name: z.string().trim(),
	module: z.string().trim(),
	description: z.ostring(),
	validator: z.string(),
	parameters: z.object({
		parameter: z.array(z.optional(jobSchemaParameter)),
	}),
	'status-codes': z.object({
		status: z.array(jobSchemaStatusCode),
	}),
});

const jobSchema = z.array(jobSchemaObject);

async function jobSchemaValidator() {
	try {
		const parsedBuffer = fs.readFileSync(
			path.resolve(process.cwd(), 'job.json'),
			{
				encoding: 'utf8',
			}
		);
		const jsonData = JSON.parse(parsedBuffer);
		const jobs = await jobSchema.parseAsync(jsonData, {
			async: true,
		});

		const jobParameters = jobs.map((job) => {
			return job?.parameters.parameter;
		});

		let isValid = true;

		jobParameters.forEach((param) => {
			param?.forEach((p) => {
				if (p?.['default-value']) {
					switch (p['@type']) {
						case 'date':
							isValid = !Number.isNaN(
								Date.parse(p?.['default-value'] as string)
							);
							break;
						case 'number':
							isValid = typeof p?.['default-value'] === 'number';
							break;
						case 'boolean':
							isValid = typeof p?.['default-value'] === 'boolean';
							break;
						default:
							isValid = typeof p?.['default-value'] === 'string';
					}
					if (!isValid) {
						throw SyntaxError('wrong');
					}
				}
				if (p?.['enum-values']) {
					switch (p['@type']) {
						case 'date':
							isValid = p['enum-values'].value.every(
								(val) => !Number.isNaN(Date.parse(val as string))
							);
							break;
						case 'number':
							isValid = p['enum-values'].value.every(
								(val) => typeof val === 'number'
							);
							break;
						default:
							isValid = p['enum-values'].value.every(
								(val) => typeof val === 'string'
							);
					}
					if (!isValid) {
						throw SyntaxError('wrong');
					}
				}
			});
		});

		return jobs;
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

export default jobSchemaValidator;
