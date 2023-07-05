import { ValidationError } from 'express-validator';

export interface IApiError {
	status: number;
	errors: ValidationError[];
	message: string;
}

class ApiError extends Error {
	status: number;
	errors: ValidationError[];

	constructor(status: number, message: string, errors: ValidationError[] = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	};

	static badRequest(message: string, errors: ValidationError[] = []): IApiError {
		return new ApiError(400, message, errors);
	};

	static unAuthorizedError(): IApiError {
		return new ApiError(401, 'Пользователь не авторизован');
	};

	static noAccess(): IApiError {
		return new ApiError(403, 'Нет доступа');
	};

	static internal(message: string): IApiError {
		return new ApiError(500, message);
	};
}

export default ApiError;
