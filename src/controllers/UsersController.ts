import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, NextFunction, Response } from 'express';
import { User } from '@prisma/client';

import { BaseController } from './BaseController';
import { ILogger } from '../types/logger.interface';
import { IUserController } from '../types/userController.interface';
import { TYPES } from '../types';
import { IUserService } from '../types/userService.interface';
import { HttpError } from '../utils/HttpError';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUserService
	) {
		super(loggerService);

		this.bindRoutes([
			{ path: '/all', method: 'get', func: this.getAll },
		])
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const users: User[] | null = await this.userService.getAll();

			if (!users) {
				return next(HttpError.badRequest('Пользователи не найдены'));
			}

			return res.json(users);
		} catch (error) {
			next(error);
		}
	}
}
