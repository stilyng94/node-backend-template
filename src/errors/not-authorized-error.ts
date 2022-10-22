import CustomError from './custom-error';

class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor(message = 'Not authorized') {
		super(message);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthorizedError;
