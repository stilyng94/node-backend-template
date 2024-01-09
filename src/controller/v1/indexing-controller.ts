import dbClient from '@/libs/db-client';
import meilisearchCLient from '@/libs/meilisearch-client';
import { NextFunction, Request, Response } from 'express';
import opensearchClient from '@/libs/opensearch-client';

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

async function createIndexWithOpensearch(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { index } = req.body;
		const newIndex = await opensearchClient.indices.create({ index });
		return res.status(200).json(newIndex);
	} catch (error) {
		return next(error);
	}
}

async function indexDocumentWithOpensearch(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const doc = {
			id: '1',
			title: 'A very nice meaty dish',
			desc: 'A beautiful description of the recipe',
			date: '2015-05-01T04:00:00.000Z',
			categories: ['Vegan', 'Tree Nut Free', 'Soy Free', 'No Sugar Added'],
			ingredients: ['list', 'of', 'ingredients'],
			directions: ['list', 'of', 'steps', 'to prepare the dish'],
			calories: 32.0,
			fat: 1.0,
			protein: 1.0,
			rating: 5.0,
			sodium: 959.0,
		};
		const resp = await opensearchClient.index(
			{ refresh: true, index: 'foodie', body: doc, id: doc.id },
			{}
		);
		return res.status(200).json(resp);
	} catch (error) {
		return next(error);
	}
}

async function indexDocumentsWithOpensearch(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const docs = [
			{
				id: '2',

				title: 'A very nice meaty dish',
				desc: 'A beautiful description of the recipe',
				date: '2015-05-01T04:00:00.000Z',
				categories: ['Vegan', 'Tree Nut Free', 'Soy Free', 'No Sugar Added'],
				ingredients: ['list', 'of', 'ingredients'],
				directions: ['list', 'of', 'steps', 'to prepare the dish'],
				calories: 32.0,
				fat: 1.0,
				protein: 1.0,
				rating: 5.0,
				sodium: 959.0,
			},
			{
				id: '3',

				title: 'A very nice fishy dish',
				desc: 'A beautiful description of the recipe',
				date: '2015-05-01T04:00:00.000Z',
				categories: ['Vegan', 'Tree Nut Free', 'Soy Free', 'No Sugar Added'],
				ingredients: ['list', 'of', 'ingredients'],
				directions: ['list', 'of', 'steps', 'to prepare the dish'],
				calories: 32.0,
				fat: 1.0,
				protein: 1.0,
				rating: 5.0,
				sodium: 959.0,
			},
			{
				id: '4',

				title: 'A very nice bushy dish',
				desc: 'A beautiful description of the recipe',
				date: '2015-05-01T04:00:00.000Z',
				categories: ['Vegan', 'Tree Nut Free', 'Soy Free', 'No Sugar Added'],
				ingredients: ['list', 'of', 'ingredients'],
				directions: ['list', 'of', 'steps', 'to prepare the dish'],
				calories: 32.0,
				fat: 1.0,
				protein: 1.0,
				rating: 5.0,
				sodium: 959.0,
			},
			{
				id: '5',

				title: 'A very nice bloody dish',
				desc: 'A beautiful description of the recipe',
				date: '2015-05-01T04:00:00.000Z',
				categories: ['Vegan', 'Tree Nut Free', 'Soy Free', 'No Sugar Added'],
				ingredients: ['list', 'of', 'ingredients'],
				directions: ['list', 'of', 'steps', 'to prepare the dish'],
				calories: 32.0,
				fat: 1.0,
				protein: 1.0,
				rating: 5.0,
				sodium: 959.0,
			},
		];
		const resp = await opensearchClient.helpers.bulk({
			datasource: docs,
			refresh: true,
			onDocument(doc) {
				return { index: { _index: 'foodie', _id: doc.id } };
			},
		});
		return res.status(200).json(resp);
	} catch (error) {
		return next(error);
	}
}

async function getIndicesWithOpensearch(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const newIndex = await opensearchClient.cat.indices({ format: 'json' });
		return res.status(200).json(newIndex);
	} catch (error) {
		return next(error);
	}
}

export default {
	createIndex,
	indexDocuments,
	searchDocument,
	indexDocumentsWithOpensearch,
	getIndicesWithOpensearch,
	createIndexWithOpensearch,
	indexDocumentWithOpensearch,
};
// Use facets for categorizing
// const response = await index.updateSettings({
//   attributesForFaceting: ['category', 'year']
// })
// await index.search('paul', { facetFilters: [ 'category:Chemistry', ['year:1995', 'year:1996', 'year:1997'] ]})
