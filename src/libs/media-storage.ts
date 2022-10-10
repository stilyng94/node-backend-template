import multer from 'multer';
import { Request } from 'express';
import localContentStorageService from '../service/local-content-storage-service';

const DEFAULT_MEDIA_SIZE = '124288000'; // 100mb+ as default

const fileSize = parseInt(
	process.env.FILE_UPLOAD_SIZE ?? DEFAULT_MEDIA_SIZE,
	10
);
const acceptedMimeTypes = new Set([
	'image/apng',
	'image/gif',
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/svg+xml',
	'image/webp',
	'audio/wave',
	'audio/wav',
	'audio/x-wav',
	'application/pdf',
	'audio/x-pn-wav',
	'audio/webm',
	'video/webm',
	'audio/opus',
	'audio/ogg',
	'video/ogg',
	'application/ogg',
	'video/mpeg',
	'video/mp4',
	'audio/mpeg',
	'video/x-matroska',
	'video/x-msvideo',
	'audio/aac',
]);

/**
 *@description: Checks for file mime type
 */
const mediaMimeFilter = (
	_: Request,
	file: Express.Multer.File,
	cb: (arg0: null, arg1: boolean) => void
) => {
	if (acceptedMimeTypes.has(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const mediaStorage = multer({
	storage: localContentStorageService.storage,
	fileFilter: mediaMimeFilter,
	limits: {
		fileSize,
	},
}).single('media');

export default mediaStorage;
