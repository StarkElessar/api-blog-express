import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { hash } from 'bcrypt';
import { Token, User } from '@prisma/client';

import { HttpError } from '../utils/HttpError';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserEntity } from '../entities/UserEntity';
import { IUserService } from '../types/userService.interface';
import { DiTypes } from '../diTypes';
import { IConfigService } from '../types/configService.interface';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { ITokenService } from '../types/tokenService.interface';
import { ITokensRepository } from '../types/tokensRepository.interface';
import { ITokenPair } from '../types/tokenPair';
import { IUserData } from '../types/user.interface';
import { UserResponseDto } from '../dtos/UserResponseDto';
import { UserDto } from '../dtos/UserDto';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(DiTypes.TokenService) private _tokenService: ITokenService,
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
		@inject(DiTypes.UsersRepository) private _usersRepository: IUsersRepository,
		@inject(DiTypes.TokensRepository) private _tokensRepository: ITokensRepository,
	) {
	}

	public async createUser({ email, password, role = 'user', confirmPassword }: UserRegisterDto): Promise<User> {
		const existedUser: User | null = await this._usersRepository.findOneByEmail(email);

		if (existedUser) {
			throw HttpError.unprocessableEntity('createUser', 'Такой пользователь уже существует', []);
		}

		if (password !== confirmPassword) {
			throw HttpError.unprocessableEntity('createUser', 'Пароли не совпадают', []);
		}

		const newUser: UserEntity = new UserEntity(email, role);
		const salt: string = this._configService.get('SALT');
		await newUser.setPassword(password, Number(salt));

		return this._usersRepository.create(newUser);
	}

	public async validateUser({ email, password }: UserLoginDto): Promise<UserForTokensDto> {
		const existedUser: User | null = await this._usersRepository.findOneByEmail(email);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const newUser: UserEntity = new UserEntity(existedUser.email, existedUser.role, existedUser.password);
		const isPasswordEquals: boolean = await newUser.comparePassword(password);

		if (!isPasswordEquals) {
			throw HttpError.badRequest('Неверный пароль');
		}

		return new UserForTokensDto(existedUser);
	}

	// TODO: подумать, может быть не правильное название у метода?
	public async validateUserForRequestActivationLink(email: string) {
		const existedUser: User | null = await this._usersRepository.findOneByEmail(email);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		if (existedUser.isActivated) {
			throw HttpError.badRequest('Аккаунт уже был активирован');
		}

		return existedUser;
	}

	public async activate(id: number): Promise<User | null> {
		const user: User | null = await this._usersRepository.findOneById(id);

		if (!user) {
			throw HttpError.badRequest('Некорректная ссылка активации');
		}

		if (user.isActivated) {
			throw HttpError.badRequest('Аккаунт уже был активирован');
		}

		return this._usersRepository.update(user.id, { isActivated: true });
	}

	public async refresh(refreshToken: string): Promise<IUserData> {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const secretKey: string = this._configService.get('JWT_REFRESH');
		const userData: UserForTokensDto | null = await this._tokenService.validateToken(refreshToken, secretKey);
		const tokenFromDB: Token | null = await this._tokensRepository.findByToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const user: User | null = await this._usersRepository.findOneById(userData.id);

		if (!user) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const userDataForTokens: UserForTokensDto = new UserForTokensDto(user);
		const userDataResponse: UserResponseDto = new UserResponseDto(user);
		const tokens: ITokenPair = await this._tokenService.generateTokens(userDataForTokens);
		await this._tokenService.updateToken(userDataForTokens.id, tokens.refreshToken);

		return { ...tokens, user: userDataResponse };
	}

	public async sendPasswordResetLink(email: string): Promise<Token | null> {
		const existedUser: User | null = await this._usersRepository.findOneByEmail(email);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const userDataForTokens: UserForTokensDto = new UserForTokensDto(existedUser);
		const resetToken: string = await this._tokenService.generateResetToken(userDataForTokens);
		return this._tokensRepository.update(existedUser.id, resetToken);
	}

	public async resetPassword(token: string): Promise<User> {
		const secretKey: string = this._configService.get('JWT_ACCESS');
		const userData: UserForTokensDto = await this._tokenService.validateToken(token, secretKey);
		const existedUser: User | null = await this._usersRepository.findOneById(userData.id);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		return existedUser;
	}

	public async updatePassword(userId: number, password: string): Promise<User | null> {
		const userData: User | null = await this._usersRepository.findOneById(userId);

		if (!userData) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const salt: string = this._configService.get('SALT');
		const newHashPassword: string = await hash(password, Number(salt));
		return this._usersRepository.update(userId, { password: newHashPassword });
	}

	public async getCurrentUser(userId: number): Promise<UserDto> {
		const userData: User | null = await this._usersRepository.findOneById(userId);

		if (!userData) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		return new UserDto(userData);
	}

	public async getAll(): Promise<User[] | null> {
		return this._usersRepository.findAll();
	}
}
