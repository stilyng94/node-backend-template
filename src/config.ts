import { parseEnv, port } from 'znv';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const url = z.string().url();
const environment = z
	.enum(['test', 'development', 'staging', 'production'])
	.default('development');

const meilisearchEnvironment = z
	.enum(['development', 'production'])
	.default('development');

export default parseEnv(process.env, {
	NODE_ENV: environment,
	PORT: port().default(5000),
	SMTP_PORT: port().default(465),
	FROM_ADDRESS: z.string().email(),
	SECRET: z.string(),
	REDIS_URL: url,
	REDIS_PORT: port().default(6379),
	REDIS_HOST: z.string(),
	REDIS_PASSWORD: z.string(),
	REDIS_USERNAME: z.string().default('default'),
	SENTRY_ENVIRONMENT: environment,
	SENTRY_DSN: url,
	FRONTEND_URL: url,
	DATABASE_URL: url,
	FACEBOOK_CLIENT_ID: z.string(),
	FACEBOOK_CLIENT_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	BASE_URL: url,
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	ETHEREAL_USERNAME: z.string(),
	ETHEREAL_PASSWORD: z.string(),
	ACCESS_TOKEN_SECRET: z.string(),
	ACCESS_TOKEN_EXP: z.number().int().positive(),
	REFRESH_TOKEN_SECRET: z.string(),
	REFRESH_TOKEN_EXP: z.number().int().positive(),
	USE_SESSION: z.boolean().default(false),
	MEILI_HOST: url,
	MEILI_ENV: meilisearchEnvironment,
	MEILI_MASTER_KEY: z.string(),
	MEILI_API_KEY: z.string(),
	CRON_JOB: z.boolean().default(false),
});
