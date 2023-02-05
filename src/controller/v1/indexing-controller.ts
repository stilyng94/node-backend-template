import dbClient from '@/libs/db-client';
import meilisearchCLient from '@/libs/meilisearch-client';
import { NextFunction, Request, Response } from 'express';

async function createIndex(req: Request, res: Response, next: NextFunction) {
	try {
		const { index, primaryKey } = req.body;
		const newIndex = await meilisearchCLient.createIndex(index as string, {
			primaryKey: primaryKey as string,
		});
		return res.status(200).json(newIndex);
	} catch (error) {
		return next(error);
	}
}

async function indexDocuments(req: Request, res: Response, next: NextFunction) {
	try {
		const companyIndex = meilisearchCLient.index('company');
		await companyIndex.updateSettings({
			sortableAttributes: ['createdAt', 'updatedAt'],
			stopWords: ['a', 'an', 'the', 'company', 'limited'],
		});
		const documents = await dbClient.company.findMany({});
		const task = await companyIndex.updateDocuments(documents);
		return res.status(200).json({ task });
	} catch (error) {
		return next(error);
	}
}

async function searchDocument(req: Request, res: Response, next: NextFunction) {
	try {
		const { index, query, limit } = req.query;

		const companyIndex = meilisearchCLient.index(index as string);
		const companies = await companyIndex.search(query as string, {
			sort: ['createdAt:asc'],
			limit: parseInt((limit as string) ?? 10, 10),
		});
		return res.status(200).json({ companies });
	} catch (error) {
		return next(error);
	}
}

export default { createIndex, indexDocuments, searchDocument };
// Use facets for categorizing
// const response = await index.updateSettings({
//   attributesForFaceting: ['category', 'year']
// })
// await index.search('paul', { facetFilters: [ 'category:Chemistry', ['year:1995', 'year:1996', 'year:1997'] ]})
