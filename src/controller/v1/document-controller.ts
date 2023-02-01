import NotFoundError from '@/errors/not-found-error';
import dbClient from '@/libs/db-client';
import { NextFunction, Request, Response } from 'express';

async function createDocument(req: Request, res: Response, next: NextFunction) {
	try {
		const newDoc = await dbClient.document.create({
			data: { userId: req.user.id },
		});
		return res.status(201).json({
			success: true,
			data: newDoc,
		});
	} catch (error) {
		return next(error);
	}
}

async function getDocuments(req: Request, res: Response, next: NextFunction) {
	try {
		const docs = await dbClient.document.findMany({
			where: { userId: req.user.id },
		});
		return res.status(200).json({
			success: true,
			data: docs,
		});
	} catch (error) {
		return next(error);
	}
}

async function getDocument(req: Request, res: Response, next: NextFunction) {
	try {
		const doc = await dbClient.document.findFirst({
			where: { userId: req.user.id, id: req.params.id },
		});
		return res.status(200).json({
			success: true,
			data: doc,
		});
	} catch (error) {
		return next(error);
	}
}

async function updateDocumentTitle(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const { id, title } = req.body;

		const doc = await dbClient.document.update({
			where: { id },
			data: { title },
		});
		if (!doc) {
			throw new NotFoundError(req, 'document not found');
		}
		return res.status(200).json({
			success: true,
			data: doc,
		});
	} catch (error) {
		return next(error);
	}
}
export default {
	createDocument,
	getDocuments,
	getDocument,
	updateDocumentTitle,
};
