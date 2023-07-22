import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { Token, User } from '@prisma/client';

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
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { IMailService } from '../types/mailService.interface';
import { ICookieService } from '../types/cookieService.interface';
import { IUserData } from '../types/user.interface';
import { UserResponseDto } from '../dtos/UserResponseDto';
import { AuthGuard } from '../middlewares/AuthGuard';
import { UserUpdatePasswordDto } from '../dtos/UserUpdatePasswordDto';

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
			{ path: '/reset/:token', method: 'get', func: <any>this.resetPassword },
			{
				path: '/password-reset',
				method: 'post',
				func: this.updatePasswordAfterReset,
				middlewares: [ new AuthGuard(), new ValidateMiddleware(UserUpdatePasswordDto) ]
			},
		]);
	}

	/**
	 * @route POST api/auth/register
	 * @desc Регистрация
	 * @access Public
	 */
	public async register({ body }: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const candidate: User = await this.userService.createUser(body);
			const userData: UserResponseDto = new UserResponseDto(candidate);
			const tokens: ITokenPair = await this.tokenService.generateTokens({ id: candidate.id });

			await this.tokenService.updateToken(candidate.id, tokens.refreshToken);
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
	public async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const candidate: UserForTokensDto = await this.userService.validateUser(body);
			const tokens: ITokenPair = await this.tokenService.generateTokens(candidate);
			await this.tokenService.updateToken(candidate.id, tokens.refreshToken);
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
	public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { refreshToken } = req.cookies;
			await this.tokenService.removeToken(refreshToken);
			this.cookieService.delete(res, 'refreshToken');

			this.ok(res, { message: 'Вы вышли из аккаунта' });
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

			this.ok(res, userData);
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
			const resetToken: Token | null = await this.userService.sendPasswordResetLink(body.email);

			if (!resetToken) {
				return next(HttpError.badRequest('Не удалось создать ссылку для восстановления пароля'));
			}

			await this.mailService.sendResetPasswordMail(body.email, resetToken.refreshToken);
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
	public async resetPassword(req: Request<{ token: string }>, res: Response, next: NextFunction): Promise<void> {
		try {
			const resetToken: string = req.params.token;

			if (!resetToken) {
				return next(HttpError.badRequest('Некорректная ссылка восстановления'));
			}

			const user: User = await this.userService.resetPassword(resetToken);

			if (!user.isActivated) {
				return next(HttpError.badRequest('Аккаунт не активирован'));
			}

			return res.redirect(this.configService.get('CLIENT_URL') + `/auth/reset?token=${resetToken}`);
		} catch (error) {
			next(error);
		}
	}

	public async updatePasswordAfterReset(req: Request<{}, {}, UserUpdatePasswordDto>, res: Response, next: NextFunction): Promise<void> {
		try {
			if (req.body.password !== req.body.confirmPassword) {
				next(HttpError.unprocessableEntity('updatePasswordAfterReset', 'Пароли не совпадают'));
			}

			const userData: User | null = await this.userService.updatePassword(req.user, req.body.password);

			if (!userData) {
				return next(HttpError.badRequest('Не удалось обновить пароль'));
			}

			this.ok(res, { message: 'Пароль успешно обновлён' });
		} catch (error) {
			next(error);
		}
	}
}
