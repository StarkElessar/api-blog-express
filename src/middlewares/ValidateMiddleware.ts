import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from '../types/middleware.interface';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpError } from '../utils/HttpError';

export class ValidateMiddleware implements IMiddleware {
	constructor(private classToValidate: ClassConstructor<object>) {}
	execute(req: Request, res: Response, next: NextFunction): void {
		const instance = plainToInstance(this.classToValidate, req.body);

		validate(instance).then((errors) => {
			if (errors.length) {
				return next(HttpError.unprocessableEntity(errors, undefined, 'Validate Middleware'));
			}

			next();
		});
	}
}
