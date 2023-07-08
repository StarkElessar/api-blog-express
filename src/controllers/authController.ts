import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import UserService from '../services/userService';
import { User } from '../services/prismaService';
import { UserEntity } from '../entities/UserEntity';
import { IUserData, IUserRegData } from '../types/user.interface';
import { BaseController } from './baseController';
import { ILogger } from '../types/logger.interface';
import { TYPES } from '../types';
import { IAuthController } from '../types/authController.interface';
import { UserLoginDto } from '../dtos/userLogin.dto';

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService);

		this.bindRoutes([
			{ path: '/register', method: 'post', func: this.register },
			{ path: '/login', method: 'post', func: this.login },
			{ path: '/activate/:link', method: 'get', func: this.activate as any },
			{ path: '/logout', method: 'get', func: this.logout },
			{ path: '/refresh', method: 'get', func: this.refresh },
			{ path: '/all', method: 'get', func: this.getAll },
		])
	}
	/**
	 * @route POST /auth/register
	 * @desc Регистрация
	 * @access Public
	 */
	public async register(req: Request<{}, {}, IUserRegData>, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const userData: IUserData = await UserService.registration(req.body);

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			return res.status(201).json(userData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST /auth/login
	 * @desc Авторизация
	 * @access Public
	 */
	public async login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const userData: IUserData = await UserService.login(req.body);

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			return res.status(201).json(userData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST /activate/:link
	 * @desc Активация аккаунта
	 * @access Public
	 */
	public async activate(req: Request<{ link: string }>, res: Response, next: NextFunction): Promise<void> {
		try {
			const activationLink: string = req.params.link;
			await UserService.activate(activationLink);

			return res.redirect(process.env.CLIENT_URL as string);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST /logout
	 * @desc Выход из аккаунта
	 * @access Public
	 * */
	public async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { refreshToken } = req.cookies;
			await UserService.logout(refreshToken);

			res.clearCookie('refreshToken');
			/** TODO: Решить, что лучше вернуть если токен успешно удален */
			return res.json({ message: 'Вы вышли из аккаунта' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST /refresh
	 * @desc Обновление refresh токена
	 * @access Public
	 * */
	public async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { refreshToken } = req.cookies;
			const userData: IUserData = await UserService.refresh(refreshToken);

			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			return res.status(201).json(userData);
		} catch (error) {
			next(error);
		}
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
