import multer from 'multer';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import { Request } from 'express';
import logger from '../libs/logger';
import mediaHelpers from '../helpers/media-helpers';

const MEDIA_DESTINATION = path.join('public', 'uploads');

const storage = multer.diskStorage({
	destination: MEDIA_DESTINATION,
	filename: (_, file, cb) => {
		cb(null, mediaHelpers.createFileName(file));
	},
});

function streamMediaContent(filePath: string) {
	return fs.createReadStream(filePath, { autoClose: true });
}

/**
 *@description: generate url for locally stored media
 */
function generateMediaUrl(req: Request) {
	const media = req.file;
	const url = `${req.protocol}://${req.get('host')}`;
	return `${url}/uploads/${media?.filename}`;
}

async function deleteMediaContent(filePaths: Array<string>) {
	try {
		const fileUnlink = promisify(fs.unlink);
		const promises = filePaths.map((filePath) => fileUnlink(filePath));
		await Promise.allSettled(promises);
	} catch (error) {
		logger.error(error);
	}
}

export default {
	streamMediaContent,
	deleteMediaContent,
	generateMediaUrl,
	storage,
};
