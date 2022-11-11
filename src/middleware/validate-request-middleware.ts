import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import RequestValidationError from '../errors/request-validation-error';

/**
 *
 * @description Middleware for errors thrown from express-validator
 */
const validateRequestMiddleWare = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array());
	}
	return next();
};

export default validateRequestMiddleWare;
