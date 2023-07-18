import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Token, User } from '@prisma/client';

import { HttpError } from '../utils/HttpError';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserEntity } from '../entities/UserEntity';
import { IUserService } from '../types/userService.interface';
import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { ITokenService } from '../types/tokenService.interface';
import { ITokensRepository } from '../types/tokensRepository.interface';
import { ITokenPair } from '../types/tokenPair';
import { IUserData } from '../types/user.interface';
import { v4 as uuid } from 'uuid';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
		@inject(TYPES.TokensRepository) private tokensRepository: ITokensRepository,
	) {
	}

	public async createUser({ email, password, role = 'user' }: UserRegisterDto): Promise<User | null> {
		const existedUser: User | null = await this.usersRepository.findOneByEmail(email);

		if (existedUser) {
			return null;
		}

		const newUser: UserEntity = new UserEntity(email, role);
		const salt: string = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));

		/** TODO: Проверка, что он есть? Если есть - возвращаем null иначе создаём */
		return this.usersRepository.create(newUser);
	}

	public async validateUser({ email, password }: UserLoginDto): Promise<UserForTokensDto | null> {
		const existedUser: User | null = await this.usersRepository.findOneByEmail(email);

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

	public async activate(activationLink: string): Promise<User | null> {
		const user: User | null = await this.usersRepository.findOneByActivatedLink(activationLink);

		if (!user) {
			throw HttpError.badRequest('Некорректная ссылка активации');
		}

		if (user.isActivated) {
			throw HttpError.badRequest('Аккаунт уже был активирован');
		}

		return this.usersRepository.update(user.id, { isActivated: true });
	}

	public async refresh(refreshToken: string): Promise<IUserData> {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const userData: UserForTokensDto | null = await this.tokenService.validateRefreshToken(refreshToken);
		const tokenFromDB: Token | null = await this.tokensRepository.findByToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const user: User | null = await this.usersRepository.findOneByEmail(userData.email);

		if (!user) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const userDto: UserForTokensDto = new UserForTokensDto(user);
		const tokens: ITokenPair = await this.tokenService.generateTokens(userDto);
		await this.tokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	public async sendPasswordResetLink(email: string): Promise<User | null> {
		const existedUser: User | null = await this.usersRepository.findOneByEmail(email);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const resetLink: string = uuid();
		return this.usersRepository.update(existedUser.id, {
			activationLink: resetLink
		});
	}

	public async resetPassword(link: string): Promise<User> {
		const existedUser: User | null = await this.usersRepository.findOneByActivatedLink(link);

		if (!existedUser) {
			throw HttpError.badRequest('Некорректная ссылка восстановления');
		}

		return existedUser;
	}

	public async getAll(): Promise<User[] | null> {
		return this.usersRepository.findAll();
	}
}
