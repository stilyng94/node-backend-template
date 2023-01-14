import CustomError from './custom-error';

class BadRequestError extends CustomError {
	readonly statusCode = 400;

	constructor(public message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}

	serializeErrors(): Array<{ message: string; field?: string }> {
		return [{ message: this.message }];
	}
}

export default BadRequestError;
