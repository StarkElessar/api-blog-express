import { ValidationError } from 'express-validator';

export class HttpError extends Error {
	statusCode: number;
	errors: ValidationError[];
	context?: string;

	constructor(statusCode: number, message: string, errors: ValidationError[] = [], context?: string) {
		super(message);

		this.statusCode = statusCode;
		this.message = message;
		this.errors = errors;
		this.context = context;
	}

	static badRequest(message: string, errors: ValidationError[] = []): HttpError {
		return new HttpError(400, message, errors);
	};

	static unAuthorizedError(context: string): HttpError {
		return new HttpError(401, 'Ошибка авторизации', [], context);
	};

	static noAccess(): HttpError {
		return new HttpError(403, 'Нет доступа');
	};

	static internal(message: string): HttpError {
		return new HttpError(500, message);
	};
}
