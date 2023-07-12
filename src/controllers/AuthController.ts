import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { BaseController } from './BaseController';
import { ILogger } from '../types/logger.interface';
import { TYPES } from '../types';
import { IAuthController } from '../types/authController.interface';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { ValidateMiddleware } from '../middlewares/ValidateMiddleware';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { IUserService } from '../types/userService.interface';
import { HttpError } from '../utils/HttpError';
import { ITokenService } from '../types/tokenService.interface';
import { IConfigService } from '../types/configService.interface';

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);

		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [ new ValidateMiddleware(UserRegisterDto) ]
			},
			{ path: '/login', method: 'post', func: this.login },
			// { path: '/activate/:link', method: 'get', func: this.activate as any },
			// { path: '/logout', method: 'get', func: this.logout },
			// { path: '/refresh', method: 'get', func: this.refresh },
		]);
	}

	async register({ body }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
		const result = await this.userService.createUser(body);

		if (!result) {
			return next(HttpError.unprocessableEntity([], 'Такой пользователь уже существует', 'register'));
		}

		this.ok(res, { email: result.email, id: result.id });
	}

	async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
		const result: boolean = await this.userService.validateUser(body);

		if (!result) {
			return next(HttpError.unAuthorizedError('login'));
		}

		const token: string = await this.tokenService.signJWT(body.email, this.configService.get('JWT_ACCESS_SECRET'));

		this.ok(res, { token });
	}

	// /**
	//  * @route POST api/auth/register
	//  * @desc Регистрация
	//  * @access Public
	//  */
	// public async register(req: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<Response | void> {
	// 	try {
	// 		const userData: IUserData = await this.userService.registration(req.body);
	//
	// 		res.cookie('refreshToken', userData.refreshToken, {
	// 			maxAge: 30 * 24 * 60 * 60 * 1000,
	// 			httpOnly: true,
	// 		});
	//
	// 		return res.status(201).json(userData);
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// }
	//
	// /**
	//  * @route POST api/auth/login
	//  * @desc Авторизация
	//  * @access Public
	//  */
	// public async login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<Response | void> {
	// 	try {
	// 		const userData: IUserData = await this.userService.login(req.body);
	//
	// 		res.cookie('refreshToken', userData.refreshToken, {
	// 			maxAge: 30 * 24 * 60 * 60 * 1000,
	// 			httpOnly: true,
	// 		});
	//
	// 		return res.status(201).json(userData);
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// }
	//
	// /**
	//  * @route POST api/activate/:link
	//  * @desc Активация аккаунта
	//  * @access Public
	//  */
	// public async activate(req: Request<{ link: string }>, res: Response, next: NextFunction): Promise<void> {
	// 	try {
	// 		const activationLink: string = req.params.link;
	// 		await UserService.activate(activationLink);
	//
	// 		return res.redirect(process.env.CLIENT_URL as string);
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// }
	//
	// /**
	//  * @route POST api/logout
	//  * @desc Выход из аккаунта
	//  * @access Public
	//  * */
	// public async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
	// 	try {
	// 		const { refreshToken } = req.cookies;
	// 		await UserService.logout(refreshToken);
	//
	// 		res.clearCookie('refreshToken');
	// 		return res.json({ message: 'Вы вышли из аккаунта' });
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// }
	//
	// /**
	//  * @route POST api/refresh
	//  * @desc Обновление refresh токена
	//  * @access Public
	//  * */
	// public async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
	// 	try {
	// 		const { refreshToken } = req.cookies;
	// 		const userData: IUserData = await UserService.refresh(refreshToken);
	//
	// 		res.cookie('refreshToken', userData.refreshToken, {
	// 			maxAge: 30 * 24 * 60 * 60 * 1000,
	// 			httpOnly: true,
	// 		});
	//
	// 		return res.status(201).json(userData);
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// }
}
