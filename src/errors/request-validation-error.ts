import { ValidationError } from 'express-validator';
import CustomError from './custom-error';

class RequestValidationError extends CustomError {
	readonly statusCode = 422;

	constructor(public errors: ValidationError[]) {
		super('invalid request parameters');
		Object.setPrototypeOf(this, new.target.prototype);
	}

	serializeErrors() {
		return this.errors.map((error) => ({
			message: error.msg,
			field: error.param,
		}));
	}
}

export default RequestValidationError;
