import { NextFunction, Request, Response } from 'express';
import CustomError from '../errors/custom-error';
import logger from '../libs/logger';

const globalErrorHandler = (
	error: Error,
	_: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_next: NextFunction
): Response => {
	if (error instanceof CustomError) {
		return res.status(error.statusCode).json({
			errors: error.serializeErrors(),
		});
	}

	// Non-Custom errors

	logger.error(error);
	return res
		.status(500)
		.send({ errors: [{ message: 'unknown error occurred' }] });
};

export default globalErrorHandler;
