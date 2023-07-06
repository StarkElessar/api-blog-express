import { BaseController } from './baseController';
import { LoggerService } from '../utils/loggerService';
import { Request, NextFunction, Response } from 'express';
import { HttpError } from '../utils/httpError';

export class UserController extends BaseController {
	constructor(logger: LoggerService) {
		super(logger);

		this.bindRoutes([
			{ path: '/register', method: 'post', func: this.register },
			{ path: '/login', method: 'post', func: this.login },
		])
	}

	register(req: Request, res: Response, next: NextFunction): void {
		this.ok(res, 'register');
	}

	login(req: Request, res: Response, next: NextFunction): void {
		//this.ok(res, 'login');
		next(HttpError.unAuthorizedError('login'));
	}
}
