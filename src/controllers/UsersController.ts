import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, NextFunction, Response } from 'express';

import { BaseController } from './BaseController';
import { HttpError } from '../utils/HttpError';
import { ILogger } from '../types/logger.interface';
import { IUserController } from '../types/userController.interface';
import { TYPES } from '../types';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService);

		this.bindRoutes([
			{ path: '/register', method: 'post', func: this.register },
			{ path: '/login', method: 'post', func: this.login },
		])
	}

	public register(req: Request, res: Response, next: NextFunction): void {
		this.ok(res, 'register');
	}

	public login(req: Request, res: Response, next: NextFunction): void {
		next(HttpError.unAuthorizedError('login'));
	}
}
