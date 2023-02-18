import logger from '@/libs/logger';
import meilisearchCLient from '@/libs/meilisearch-client';
import jobSchemaValidator from '@/validators/job-schema-validator';

async function validateAndIndexJobs() {
	try {
		const jobs = await jobSchemaValidator();
		await meilisearchCLient.createIndex('cron-jobs', {
			primaryKey: 'name',
		});
		const jobIndex = meilisearchCLient.index('cron-jobs');
		await jobIndex.updateSettings({
			sortableAttributes: ['name'],
			searchableAttributes: ['name'],
		});
		const task = await jobIndex.updateDocuments(jobs);
		return task;
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

export default { validateAndIndexJobs };
