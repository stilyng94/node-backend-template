/**
 * Abstract class CustomError
 */
abstract class CustomError extends Error {
	/**
	 * Status code of error
	 */
	abstract statusCode: number;

	abstract serializeErrors(): Array<{ message: string; field?: string }>;
}

export default CustomError;
