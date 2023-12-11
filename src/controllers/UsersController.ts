import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, NextFunction, Response } from 'express';
import { User } from '@prisma/client';

import { BaseController } from './BaseController';
import { ILogger } from '../types/logger.interface';
import { IUserController } from '../types/userController.interface';
import { DiTypes } from '../diTypes';
import { IUserService } from '../types/userService.interface';
import { HttpError } from '../utils/HttpError';
import { IConfigService } from '../types/configService.interface';
import { AuthGuard } from '../middlewares/AuthGuard';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(DiTypes.ILogger) private _loggerService: ILogger,
		@inject(DiTypes.UserService) private _userService: IUserService,
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
	) {
		super(_loggerService);

		this.bindRoutes([
			{
				path: '/all',
				method: 'get',
				func: this.getAll,
				middlewares: [ new AuthGuard() ]
			},
		])
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const users: User[] | null = await this._userService.getAll();

			if (!users) {
				return next(HttpError.badRequest('Пользователи не найдены'));
			}

			return res.json(users);
		} catch (error) {
			next(error);
		}
	}
}
