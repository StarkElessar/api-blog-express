import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from '../types/middleware.interface';
import { HttpError } from '../utils/HttpError';

export class AuthGuard implements IMiddleware {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (!req.user) {
			return next(HttpError.unAuthorizedError('AuthGuard'));
		}

		next();
	}
}
