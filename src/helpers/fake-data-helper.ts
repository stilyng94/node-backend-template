/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';

interface ICompany {
	bsBuzz: string;
	catchPhrase: string;
	catchPhraseDescriptor: string;
	name: string;
	id: string;
	contact: string;
}

function createRandomCompany(count = 10): Array<ICompany> {
	const ids = faker.helpers.uniqueArray(faker.random.alphaNumeric, count);
	const contacts = faker.helpers.uniqueArray(faker.phone.number, count);

	const companies = [];

	// eslint-disable-next-line no-plusplus
	for (let i = 0; i < 10; i++) {
		companies.push({
			catchPhrase: faker.company.catchPhrase(),
			catchPhraseDescriptor: faker.company.catchPhraseDescriptor(),
			bsBuzz: faker.company.bsBuzz(),
			name: faker.company.name(),
			id: ids[i],
			contact: contacts[i],
		});
	}

	return companies;
}

export default { createRandomCompany };
