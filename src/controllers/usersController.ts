import { BaseController } from './baseController';
import { Request, NextFunction, Response } from 'express';
import { HttpError } from '../utils/httpError';
import { ILogger } from '../types/logger.interface';
import { IUserController } from '../types/userController.interface';

export class UserController extends BaseController implements IUserController {
	constructor(logger: ILogger) {
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
		next(HttpError.unAuthorizedError('login'));
	}
}
