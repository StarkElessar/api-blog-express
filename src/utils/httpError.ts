import { ValidationError } from 'express-validator';

import { IHttpError } from '../types/httpError.interface';

export class HttpError extends Error implements IHttpError {
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

	public static badRequest(message: string, errors: ValidationError[] = []): HttpError {
		return new HttpError(400, message, errors);
	};

	public static unAuthorizedError(context: string): HttpError {
		return new HttpError(401, 'Ошибка авторизации', [], context);
	};

	public static noAccess(): HttpError {
		return new HttpError(403, 'Нет доступа');
	};

	public static internal(message: string): HttpError {
		return new HttpError(500, message);
	};
}
