import CustomError from './custom-error';

class NotAuthenticatedError extends CustomError {
	statusCode = 401;

	constructor(public message = 'Not authenticated') {
		super(message);
		Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthenticatedError;
