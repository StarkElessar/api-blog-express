import { Request, Response, NextFunction } from 'express';
import UserService from '../services/userService';
import { UserEntity } from '../entities/UserEntity';
import { IUserData, IUserLoginData, IUserRegData } from '../types/user.interface';

class AuthController {
	/**
	 * @route POST /auth/register
	 * @desc Регистрация
	 * @access Public
	 */
	async register(req: Request<{}, {}, IUserRegData, {}, {}>, res: Response, next: NextFunction) {
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
	async login(req: Request<{}, {}, IUserLoginData, {}, {}>, res: Response, next: NextFunction) {
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
	async activate(req: Request<{ link: string }, {}, {}, {}, {}>, res: Response, next: NextFunction) {
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
	async logout(req: Request, res: Response, next: NextFunction) {
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
	async refresh(req: Request, res: Response, next: NextFunction) {
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

	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			const users: UserEntity[] = await UserService.getAll();

			return res.json(users);
		} catch (error) {
			next(error);
		}
	}
}

export default new AuthController;
