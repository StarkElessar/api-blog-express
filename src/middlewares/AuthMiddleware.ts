import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import { IMiddleware } from '../types/middleware.interface';
import { BaseDto } from '../dtos/BaseDto';

export class AuthMiddleware implements IMiddleware {
	constructor(private _secret: string) {}

	public execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers?.authorization) {
			const [_, accessToken] = req.headers.authorization.split(' ');

			verify(accessToken, this._secret, (err, payload): void => {
				if (err) {
					return next();
				}

				if (payload) {
					req.user = (<BaseDto>payload).id;
					return next();
				}
			});
		} else {
			next();
		}
	}
}
