import { Request, Response, NextFunction } from 'express';
import UserService from '../services/userService';
import { UserEntity } from '../entities/UserEntity';
import { IUserData } from '../types/user.interface';

class AuthController {
	/**
	 * @route POST /auth/register
	 * @desc Регистрация
	 * @access Public
	 */
	async register(req: Request<{}, {}, {
		email: string,
		password: string,
		role: string | undefined
	}, {}, {}>, res: Response, next: NextFunction) {
		try {
			const { email, password, role = 'user' } = req.body;
			const userData: IUserData = await UserService.registration(email, password, role);

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
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body;
			const userData = await UserService.login(email, password);

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
	async activate(req: Request, res: Response, next: NextFunction) {
		try {
			const activationLink = req.params.link;
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

	async refresh(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies;
			const userData = await UserService.refresh(refreshToken);

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
