import CustomError from './custom-error';

class NotAuthorizedError extends CustomError {
	statusCode = 403;

	constructor(public message = 'Not authorized') {
		super(message);
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthorizedError;
