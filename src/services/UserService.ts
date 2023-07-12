import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

import MailService from './MailService';
import { HttpError } from '../utils/HttpError';
import { ITokenEntity } from '../entities/TokenEntity';
import { IUserData } from '../types/user.interface';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserEntity } from '../entities/UserEntity';
import { IUserService } from '../types/userService.interface';
import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { IUsersRepository } from '../types/usersRrepository.interface';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
	) {
	}

	public async createUser({ email, password, role = 'user' }: UserRegisterDto): Promise<User | null> {
		const existedUser = await this.usersRepository.findOne(email);

		if (existedUser) {
			return null;
		}

		const newUser: UserEntity = new UserEntity(email, role);
		const salt: string = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));

		/** TODO: Проверка, что он есть? Если есть - возвращаем null иначе создаём */
		return this.usersRepository.create(newUser);
	}

	public async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
		const existedUser: User | null = await this.usersRepository.findOne(email);

		if (!existedUser) {
			return false;
		}

		const newUser: UserEntity = new UserEntity(existedUser.email, existedUser.role, existedUser.password);
		return newUser.comparePassword(password);
	}

	// public async registration({ email, password, role = 'user' }: UserRegisterDto): Promise<IUserData> {
	// 	const candidate: User | null = await this.usersRepository.create({ email, password, role = 'user' });
	//
	// 	if (candidate) {
	// 		throw HttpError.unprocessableEntity(
	// 			[],
	// 			`Пользователь с таким почтовым адресом ${email} уже существует`,
	// 			'register'
	// 		);
	// 	}
	//
	// 	const hashPassword: string = await bcrypt.hash(password, 10);
	// 	const activationLink: string = uuid();
	// 	const user: User = await prisma.user.create({
	// 		data: {
	// 			email,
	// 			password: hashPassword,
	// 			activationLink,
	// 			role
	// 		}
	// 	});
	//
	// 	await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
	//
	// 	const userDto: UserForTokensDto = new UserForTokensDto(user);
	// 	const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });
	// 	await TokenService.saveToken(userDto.id, tokens.refreshToken);
	//
	// 	return { ...tokens, user: userDto };
	// }
	//
	// public async login({ email, password }: UserLoginDto): Promise<IUserData> {
	// 	const user: User | null = await this.usersRepository.findOne(email);
	// 	if (!user) {
	// 		throw HttpError.badRequest('Пользователь с таким email не найден');
	// 	}
	//
	// 	const isPasswordEquals: boolean = await bcrypt.compare(password, user.password);
	// 	if (!isPasswordEquals) {
	// 		throw HttpError.badRequest('Неверный пароль');
	// 	}
	//
	// 	const userDto: UserForTokensDto = new UserForTokensDto(user);
	// 	const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });
	//
	// 	await TokenService.saveToken(userDto.id, tokens.refreshToken);
	//
	// 	return { ...tokens, user: userDto };
	// }

	//
	// public async activate(activationLink: string): Promise<User> {
	// 	const user: User | null = await prisma.user.findFirst({ where: { activationLink } });
	//
	// 	if (!user) {
	// 		throw HttpError.badRequest('Некорректная ссылка активации');
	// 	}
	//
	// 	return prisma.user.update({
	// 		where: { id: user.id },
	// 		data: { isActivated: true },
	// 	});
	// }
	//
	// public async logout(refreshToken: string) {
	// 	if (!refreshToken) {
	// 		throw HttpError.unAuthorizedError('logout');
	// 	}
	//
	// 	return TokenService.removeToken(refreshToken);
	// }
	//
	// public async refresh(refreshToken: string): Promise<IUserData> {
	// 	if (!refreshToken) {
	// 		throw HttpError.unAuthorizedError('refresh');
	// 	}
	//
	// 	const userData: UserForTokensDto | null = TokenService.validateRefreshToken(refreshToken);
	// 	const tokenFromDB: ITokenEntity = await TokenService.findToken(refreshToken);
	//
	// 	if (!userData || !tokenFromDB) {
	// 		throw HttpError.unAuthorizedError('refresh');
	// 	}
	//
	// 	const user: User | null = await prisma.user.findFirst({ where: { id: userData.id } });
	//
	// 	if (!user) {
	// 		throw HttpError.badRequest('Пользователь не найден');
	// 	}
	//
	// 	const userDto: UserForTokensDto = new UserForTokensDto(user);
	// 	const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });
	//
	// 	await TokenService.saveToken(userDto.id as string, tokens.refreshToken);
	//
	// 	return { ...tokens, user: userDto };
	// }
	//
	public async getAll(): Promise<User[] | null> {
		return this.usersRepository.findAll();
	}
}
