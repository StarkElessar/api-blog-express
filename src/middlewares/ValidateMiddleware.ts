import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { IMiddleware } from '../types/middleware.interface';
import { HttpError } from '../utils/HttpError';

export class ValidateMiddleware implements IMiddleware {
	constructor(private _classToValidate: ClassConstructor<object>) {}
	execute(req: Request, res: Response, next: NextFunction): void {
		const instance = plainToInstance(this._classToValidate, req.body);

		validate(instance).then((errors) => {
			if (errors.length) {
				return next(HttpError.unprocessableEntity('Validate Middleware', undefined, errors));
			}

			next();
		});
	}
}
