import { Request } from 'express';
import CustomError from './custom-error';

/**
 * Error for unknown routes and data
 */
class NotFoundError extends CustomError {
	readonly statusCode = 404;

	constructor(req: Request, message?: string) {
		super(message ?? `Route not found: ${req.originalUrl}`);
		Object.setPrototypeOf(this, new.target.prototype);
	}

	serializeErrors(): Array<{ message: string; field?: string }> {
		return [{ message: this.message }];
	}
}
export default NotFoundError;
