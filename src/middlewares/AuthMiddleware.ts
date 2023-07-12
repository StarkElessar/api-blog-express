import { IMiddleware } from '../types/middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export class AuthMiddleware implements IMiddleware {
	private readonly _secret: string;

	constructor(secret: string) {
		this._secret = secret;
	}

	public execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers?.authorization) {
			const [_, token] = req.headers.authorization.split(' ');

			verify(token, this.secret, (err, payload): void => {
				if (err) {
					return next();
				}

				if (payload) {
					req.user = payload.email;
					return next();
				}
			});
		}

		next();
	}

	get secret(): string {
		return this._secret;
	}
}
