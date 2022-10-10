import CustomError from './custom-error';

class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor() {
		super('Not authorized');
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
export default NotAuthorizedError;
