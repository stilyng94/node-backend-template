import CustomError from './custom-error';

class NotAuthorizedError extends CustomError {
	readonly statusCode = 403;

	constructor(public message = 'Not authorized') {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthorizedError;
