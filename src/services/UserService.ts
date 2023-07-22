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
import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { ITokenService } from '../types/tokenService.interface';
import { ITokensRepository } from '../types/tokensRepository.interface';
import { ITokenPair } from '../types/tokenPair';
import { IUserData } from '../types/user.interface';
import { UserResponseDto } from '../dtos/UserResponseDto';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.TokenService) private tokenService: ITokenService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
		@inject(TYPES.TokensRepository) private tokensRepository: ITokensRepository,
	) {
	}

	public async createUser({ email, password, role = 'user' }: UserRegisterDto): Promise<User> {
		const existedUser: User | null = await this.usersRepository.findOneByEmail(email);

		if (existedUser) {
			throw HttpError.unprocessableEntity('createUser', 'Такой пользователь уже существует', []);
		}

		const newUser: UserEntity = new UserEntity(email, role);
		const salt: string = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));

		return this.usersRepository.create(newUser);
	}

	public async validateUser({ email, password }: UserLoginDto): Promise<UserForTokensDto> {
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

		const secretKey: string = this.configService.get('JWT_REFRESH');
		const userData: UserForTokensDto | null = await this.tokenService.validateToken(refreshToken, secretKey);
		const tokenFromDB: Token | null = await this.tokensRepository.findByToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const user: User | null = await this.usersRepository.findOneById(userData.id);

		if (!user) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const userDataForTokens: UserForTokensDto = new UserForTokensDto(user);
		const userDataResponse: UserResponseDto = new UserResponseDto(user);
		const tokens: ITokenPair = await this.tokenService.generateTokens(userDataForTokens);
		await this.tokenService.updateToken(userDataForTokens.id, tokens.refreshToken);

		return { ...tokens, user: userDataResponse };
	}

	public async sendPasswordResetLink(email: string): Promise<Token | null> {
		const existedUser: User | null = await this.usersRepository.findOneByEmail(email);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const userDataForTokens: UserForTokensDto = new UserForTokensDto(existedUser);
		const resetToken: string = await this.tokenService.generateResetToken(userDataForTokens);
		return this.tokensRepository.update(existedUser.id, resetToken);
	}

	public async resetPassword(token: string): Promise<User> {
		const secretKey: string = this.configService.get('JWT_ACCESS');
		const userData: UserForTokensDto | null = await this.tokenService.validateToken(token, secretKey);

		if (!userData) {
			throw HttpError.badRequest('Некорректная ссылка восстановления');
		}

		const existedUser: User | null = await this.usersRepository.findOneById(userData.id);

		if (!existedUser) {
			throw HttpError.badRequest('Пользователь для восстановления пароля не найден');
		}

		return existedUser;
	}

	public async updatePassword(userId: number, password: string): Promise<User | null> {
		const userData: User | null = await this.usersRepository.findOneById(userId);

		if (!userData) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const salt: string = this.configService.get('SALT');
		const newHashPassword: string = await hash(password, Number(salt));
		return this.usersRepository.update(userId, { password: newHashPassword });
	}

	public async getAll(): Promise<User[] | null> {
		return this.usersRepository.findAll();
	}
}
