import { verify } from 'jsonwebtoken';

import { IMiddleware } from '../types/middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { UserForTokensDto } from '../dtos/UserForTokensDto';

export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}

	public execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers?.authorization) {
			const [_, accessToken] = req.headers.authorization.split(' ');

			verify(accessToken, this.secret, (err, payload): void => {
				if (err) {
					return next();
				}

				if (payload) {
					req.user = (<UserForTokensDto>payload).id;
					return next();
				}
			});
		} else {
			next();
		}
	}
}
