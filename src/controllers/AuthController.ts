import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { Token, User } from '@prisma/client';

import { BaseController } from './BaseController';
import { ILogger } from '../types/logger.interface';
import { DiTypes } from '../diTypes';
import { IAuthController } from '../types/authController.interface';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { ValidateMiddleware } from '../middlewares/ValidateMiddleware';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { IUserService } from '../types/userService.interface';
import { HttpError } from '../utils/HttpError';
import { ITokenService } from '../types/tokenService.interface';
import { IConfigService } from '../types/configService.interface';
import { IMailService } from '../types/mailService.interface';
import { ICookieService } from '../types/cookieService.interface';
import { IUserData } from '../types/user.interface';
import { AuthGuard } from '../middlewares/AuthGuard';
import { UserUpdatePasswordDto } from '../dtos/UserUpdatePasswordDto';
import { UserDto } from '../dtos/UserDto';
import { EmailValidationDto } from '../dtos/EmailValidationDto';
import { ITokenParams } from '../types';
import { GenerateTokenDto } from '../dtos/GenerateTokenDto';

@injectable()
export class AuthController extends BaseController implements IAuthController {
	constructor(
		@inject(DiTypes.ILogger) loggerService: ILogger,
		@inject(DiTypes.UserService) private _userService: IUserService,
		@inject(DiTypes.TokenService) private _tokenService: ITokenService,
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
		@inject(DiTypes.MailService) private _mailService: IMailService,
		@inject(DiTypes.CookieService) private _cookieService: ICookieService,
	) {
		super(loggerService);

		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [ new ValidateMiddleware(UserRegisterDto) ]
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [ new ValidateMiddleware(UserLoginDto) ]
			},
			{
				path: '/activate/:token',
				method: 'get',
				func: this.activate
			},
			{
				path: '/request-activation-link',
				method: 'post',
				func: this.requestActivationLink,
				middlewares: [ new ValidateMiddleware(EmailValidationDto) ]
			},
			{
				path: '/get-current-user',
				method: 'get',
				func: this.getCurrentUser,
				middlewares: [ new AuthGuard() ]
			},
			{
				path: '/logout',
				method: 'get',
				func: this.logout
			},
			{
				path: '/refresh',
				method: 'get',
				func: this.refresh
			},
			{
				path: '/reset',
				method: 'post',
				func: this.sendPasswordResetLink
			},
			{
				path: '/reset/:token',
				method: 'get',
				func: this.resetPassword
			},
			{
				path: '/password-reset',
				method: 'post',
				func: this.updatePasswordAfterReset,
				middlewares: [ new AuthGuard(), new ValidateMiddleware(UserUpdatePasswordDto) ]
			},
		]);
	}

	/**
	 * @route POST: api/auth/register
	 * @desc Регистрация пользователя
	 * @access Public
	 */
	public async register(req: Request<{}, {}, UserRegisterDto>, res: Response, next: NextFunction) {
		try {
			const { id, email }: User = await this._userService.createUser(req.body);
			const token = await this._tokenService.generateToken(new GenerateTokenDto({
				payload: { id },
				expires: '60m',
				secretKey: this._configService.get('JWT_ACTIVATE')
			}));

			//TODO: поискать сервис для проверки существующих email(почитать за гугл, он 100% должен проверять эти вещи)
			const result = await this._mailService.sendActivationMail({ email, token });

			// TODO: сделать адекватную обработку, после отправки письма:
			console.log(result);

			this.send(res, 201, { message: 'Пользователь создан. Письмо для активации отправлено на почту', email });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST: api/auth/login
	 * @desc Авторизация
	 * @access Public
	 */
	public async login({ body }: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction) {
		try {
			const candidate = await this._userService.validateUser(body);
			const { accessToken, refreshToken } = await this._tokenService.generateTokens(candidate.id);

			await this._tokenService.updateToken(candidate.id, refreshToken);
			this._cookieService.save(res, 'refreshToken', refreshToken);

			this.ok(res, { user: candidate, accessToken });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET: api/auth/activate/:token
	 * @desc Активация аккаунта
	 * @access Public
	 */
	public async activate(req: Request<ITokenParams>, res: Response, next: NextFunction) {
		try {
			const token = req.params.token;
			const secret = this._configService.get('JWT_ACTIVATE');
			const { id } = await this._tokenService.validateToken(token, secret);

			await this._userService.activate(id);
			this.ok(res, { message: 'Аккаунт успешно активирован' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST: api/auth/request-activation-link
	 * @desc Повторный запрос на отправку письма для активации аккаунта
	 * @access Public
	 * */
	public async requestActivationLink({ body }: Request<{}, {}, EmailValidationDto>, res: Response, next: NextFunction) {
		try {
			const email = body.email;
			const { id } = await this._userService.validateUserForRequestActivationLink(email);
			const token = await this._tokenService.generateToken(new GenerateTokenDto({
				secretKey: this._configService.get('JWT_ACTIVATE'),
				expires: '60m',
				payload: { id }
			}));
			const result = await this._mailService.sendActivationMail({ email, token });

			console.log(result);

			this.ok(res, { message: 'Письмо для активации успешно отправлено на почтовый адрес ' + email });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET: api/auth/get-current-user
	 * @desc Получить данные текущего авторизированного пользователя
	 * @access Private
	 * */
	public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
		try {
			const user: UserDto = await this._userService.getCurrentUser(req.user);
			this.ok(res, user);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET: api/auth/logout
	 * @desc Выход из аккаунта
	 * @access Public
	 * */
	public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { refreshToken } = req.cookies;
			await this._tokenService.removeToken(refreshToken);
			this._cookieService.delete(res, 'refreshToken');

			this.ok(res, { message: 'Вы вышли из аккаунта' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET: api/auth/refresh
	 * @desc Обновление refresh токена
	 * @access Public
	 * */
	public async refresh(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.cookies;
			const userData: IUserData = await this._userService.refresh(refreshToken);
			this._cookieService.save(res, 'refreshToken', userData.refreshToken);

			this.ok(res, userData);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST: api/auth/reset
	 * @desc Запрос на восстановление пароля
	 * @access Public
	 * */
	public async sendPasswordResetLink({ body }: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) {
		const email = body.email;

		try {
			const resetToken: Token | null = await this._userService.sendPasswordResetLink(email);

			if (!resetToken) {
				return next(HttpError.badRequest('Не удалось создать ссылку для восстановления пароля'));
			}

			const result = await this._mailService.sendResetPasswordMail({
				email,
				token: resetToken.refreshToken
			});

			// TODO: сделать адекватную обработку, после отправки письма:
			console.log(result);
			this.ok(res, { message: 'Письмо для восстановления пароля отправлено на почту' });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route GET: api/auth/reset/:link
	 * @desc Сброс пароля
	 * @access Public
	 * */
	public async resetPassword(req: Request<ITokenParams>, res: Response, next: NextFunction) {
		try {
			const resetToken: string = req.params.token;

			if (!resetToken) {
				return next(HttpError.badRequest('Некорректная ссылка восстановления'));
			}

			const user: User = await this._userService.resetPassword(resetToken);

			if (!user.isActivated) {
				return next(HttpError.badRequest('Аккаунт не активирован'));
			}

			return res.redirect(this._configService.get('CLIENT_URL') + `/auth/reset?token=${ resetToken }`);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * @route POST: api/auth/password-reset
	 * @desc Обновить пароль пользователя после сброса
	 * @access Private
	 * */
	public async updatePasswordAfterReset(req: Request<{}, {}, UserUpdatePasswordDto>, res: Response, next: NextFunction) {
		try {
			if (req.body.password !== req.body.confirmPassword) {
				next(HttpError.unprocessableEntity('updatePasswordAfterReset', 'Пароли не совпадают'));
			}

			const userData: User | null = await this._userService.updatePassword(req.user, req.body.password);

			if (!userData) {
				return next(HttpError.badRequest('Не удалось обновить пароль'));
			}

			// TODO: сделать редирект на логин или вообще пусть фронт редиректит куда нужно..?
			this.ok(res, { message: 'Пароль успешно обновлён' });
		} catch (error) {
			next(error);
		}
	}
}