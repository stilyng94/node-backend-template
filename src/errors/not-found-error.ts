import { Request } from 'express';
import CustomError from './custom-error';

/**
 * Error for unknown routes and data
 */
class NotFoundError extends CustomError {
	statusCode = 404;

	constructor(req: Request) {
		const message = `Route not found: ${req.originalUrl}`;
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	serializeErrors(): Array<{ message: string; field?: string }> {
		return [{ message: this.message }];
	}
}
export default NotFoundError;
