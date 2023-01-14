import CustomError from './custom-error';

class NotAuthenticatedError extends CustomError {
	readonly statusCode = 401;

	constructor(public message = 'Not authenticated') {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthenticatedError;
