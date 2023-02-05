import dbClient from '@/libs/db-client';
import logger from '@/libs/logger';
import authHelpers from '@/helpers/auth-helpers';
import fakeDataHelper from '@/helpers/fake-data-helper';

async function main() {
	await dbClient.$connect();

	const password = await authHelpers.hashPassword('Nkunim123#');
	const email = 'test@test.io';
	await dbClient.userLocalCredential.upsert({
		where: { email },
		create: { email, password, Account: { create: {} } },
		update: {},
	});

	// Seed companies
	const companies = fakeDataHelper.createRandomCompany();
	await dbClient.company.createMany({ data: companies });
}
main()
	.then(async () => {
		await dbClient.$disconnect();
		logger.info({}, 'seeding done...');
		process.exit();
	})
	.catch(async (e) => {
		logger.error(e);
		await dbClient.$disconnect();
		process.exit(1);
	});
