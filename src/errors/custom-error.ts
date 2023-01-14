/**
 * Abstract class CustomError
 */
abstract class CustomError extends Error {
	/**
	 * Status code of error
	 */
	abstract readonly statusCode: number;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}

	abstract serializeErrors(): Array<{ message: string; field?: string }>;
}

export default CustomError;
