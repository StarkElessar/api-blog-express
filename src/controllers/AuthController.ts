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
import { ITokenPair } from '../types/tokenPair';
import { User } from '@prisma/client';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { IMailService } from '../types/mailService.interface';
import { ICookieService } from '../types/cookieService.interface';
import { IUserData } from '../types/user.interface';

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.MailService) private mailService: IMailService,
		@inject(TYPES.CookieService) private cookieService: ICookieService,
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
			{ path: '/activate/:link', method: 'get', func: <any>this.activate },
			{ path: '/logout', method: 'get', func: this.logout },
			{ path: '/refresh', method: 'get', func: this.refresh },
			{ path: '/reset', method: 'post', func: this.sendPasswordResetLink },
			{ path: '/reset/:link', method: 'get', func: <any>this.resetPassword },
		]);
	}

	/**
	 * @route POST api/auth/register
	 * @desc Регистрация
	 * @access Public
	 */
	public async register({ body }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<void> {
		try {
			const candidate: User | null = await this.userService.createUser(body);

			if (!candidate) {
				return next(HttpError.unprocessableEntity([], 'Такой пользователь уже существует', 'register'));
			}

			const userData: UserForTokensDto = new UserForTokensDto(candidate);
			const tokens: ITokenPair = await this.tokenService.generateTokens(userData);

			await this.tokenService.saveToken(candidate.id, tokens.refreshToken);
			await this.mailService.sendActivationMail(candidate.email, <string>candidate.activationLink);
			this.cookieService.save(res, 'refreshToken', tokens.refreshToken);

			this.ok(res, { user: userData, ...tokens });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST api/auth/login
	 * @desc Авторизация
	 * @access Public
	 */
	public async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<void> {
		try {
			const candidate: UserForTokensDto | null = await this.userService.validateUser(body);

			if (!candidate) {
				return next(HttpError.unAuthorizedError('login'));
			}

			const tokens: ITokenPair = await this.tokenService.generateTokens(candidate);
			await this.tokenService.saveToken(candidate.id, tokens.refreshToken);
			this.cookieService.save(res, 'refreshToken', tokens.refreshToken);

			this.ok(res, { user: candidate, ...tokens });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET api/auth/activate/:link
	 * @desc Активация аккаунта
	 * @access Public
	 */
	public async activate(req: Request<{ link: string }>, res: Response, next: NextFunction): Promise<void> {
		try {
			const activationLink: string = req.params.link;
			await this.userService.activate(activationLink);

			return res.redirect(this.configService.get('CLIENT_URL'));
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET api/auth/logout
	 * @desc Выход из аккаунта
	 * @access Public
	 * */
	public async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { refreshToken } = req.cookies;
			await this.tokenService.removeToken(refreshToken);
			this.cookieService.delete(res, 'refreshToken');

			return res.json({ message: 'Вы вышли из аккаунта' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET api/auth/refresh
	 * @desc Обновление refresh токена
	 * @access Public
	 * */
	public async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { refreshToken } = req.cookies;
			const userData: IUserData = await this.userService.refresh(refreshToken);
			this.cookieService.save(res, 'refreshToken', userData.refreshToken);

			return res.status(201).json(userData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST api/auth/reset
	 * @desc Запрос на восстановление пароля
	 * @access Public
	 * */
	public async sendPasswordResetLink({ body }: Request<{}, {}, {
		email: string
	}>, res: Response, next: NextFunction): Promise<void> {
		try {
			const candidate: User | null = await this.userService.sendPasswordResetLink(body.email);

			if (!candidate) {
				return next(HttpError.badRequest('Не удалось создать ссылку для восстановления пароля'));
			}

			await this.mailService.sendResetPasswordMail(candidate.email, <string>candidate.activationLink);
			this.ok(res, { message: 'Письмо для восстановления пароля отправлено на почту' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET api/auth/reset/:link
	 * @desc Сброс пароля
	 * @access Public
	 * */
	public async resetPassword(req: Request<{ link: string }>, res: Response, next: NextFunction): Promise<void> {
		try { const resetLink: string = req.params.link;
			await this.userService.resetPassword(resetLink);
			const resetToken = 'asdad';

			return res.redirect(this.configService.get('CLIENT_URL') + `/auth/reset?token=${resetToken}`);
		} catch (error) {
			next(error);
		}
	}
}
