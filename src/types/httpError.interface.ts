import { ValidationError } from 'express-validator';

export interface IHttpError {
	statusCode: number;
	errors: ValidationError[];
	context?: string;
}
