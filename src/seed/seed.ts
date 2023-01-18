import dbClient from '@/libs/db-client';
import logger from '@/libs/logger';
import authHelpers from '@/helpers/auth-helpers';

async function main() {
	await dbClient.$connect();

	const password = await authHelpers.hashPassword('Nkunim123#');
	const email = 'test@test.io';
	await dbClient.userLocalCredential.upsert({
		where: { email },
		create: { email, password, Account: { create: {} } },
		update: {},
	});
}
main()
	.then(async () => {
		await dbClient.$disconnect();
		process.exit();
	})
	.catch(async (e) => {
		logger.error(e);
		await dbClient.$disconnect();
		process.exit(1);
	});
