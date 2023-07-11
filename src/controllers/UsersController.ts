import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, NextFunction, Response } from 'express';

import { BaseController } from './BaseController';
import { ILogger } from '../types/logger.interface';
import { IUserController } from '../types/userController.interface';
import { TYPES } from '../types';
import { User } from '../services/prismaService';
import UserService from '../services/UserService';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService);

		this.bindRoutes([
			{ path: '/all', method: 'get', func: this.getAll },
		])
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const users: User[] = await UserService.getAll();

			return res.json(users);
		} catch (error) {
			next(error);
		}
	}
}
