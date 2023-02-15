import z from 'zod';

/* eslint-disable no-console */
// eslint-disable-next-line import/prefer-default-export
export async function Run(args: Record<string, unknown>) {
	console.log(args);
}

export const validator = z.object({
	Age: z.number(),
	Username: z.string(),
	Gender: z.enum(['Male', 'Female', 'None']).default('None'),
	Consent: z.boolean().default(false),
});
