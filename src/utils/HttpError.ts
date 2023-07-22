import { IHttpError } from '../types/httpError.interface';

export class HttpError extends Error implements IHttpError {
	public statusCode: number;
	public errors: unknown[];
	public context?: string;

	constructor(statusCode: number, message: string, errors: unknown[] = [], context?: string) {
		super(message);

		this.statusCode = statusCode;
		this.message = message;
		this.errors = errors;
		this.context = context;
	}

	public static badRequest(message: string, errors: unknown[] = []): HttpError {
		return new HttpError(400, message, errors);
	};

	public static unAuthorizedError(context: string): HttpError {
		return new HttpError(401, 'Ошибка авторизации', [], context);
	};

	public static noAccess(): HttpError {
		return new HttpError(403, 'Нет доступа');
	};

	public static unprocessableEntity(
		context: string,
		message: string = 'Ошибка при валидации',
		errors: unknown[] = [],
	): HttpError {
		return new HttpError(422, message, errors, context);
	};

	public static internal(message: string): HttpError {
		return new HttpError(500, message);
	};
}
