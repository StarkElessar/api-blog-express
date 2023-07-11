import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

import { prisma } from './prismaService';
import MailService from './MailService';
import TokenService, { ITokenPair } from './TokenService';
import { HttpError } from '../utils/HttpError';
import { UserEntity } from '../entities/UserEntity';
import { ITokenEntity } from '../entities/TokenEntity';
import { IUserData } from '../types/user.interface';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { User } from '@prisma/client';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { UserLoginDto } from '../dtos/UserLoginDto';

class UserService {
	async registration({ email, password, role = 'user' }: UserRegisterDto): Promise<IUserData> {
		const candidate: UserEntity | null = await prisma.user.findFirst({ where: { email } });

		if (candidate) {
			throw HttpError.unprocessableEntity(
				[],
				`Пользователь с таким почтовым адресом ${email} уже существует`,
				'register'
			);
		}

		const hashPassword: string = await bcrypt.hash(password, 10);
		const activationLink: string = uuid();
		const user: User = await prisma.user.create({
			data: {
				email,
				password: hashPassword,
				activationLink,
				role
			}
		});

		await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

		const userDto: UserForTokensDto = new UserForTokensDto(user);
		const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });
		await TokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async login({ email, password }: UserLoginDto): Promise<IUserData> {
		const user: UserEntity | null = await prisma.user.findFirst({ where: { email } });
		if (!user) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const isPasswordEquals: boolean = await bcrypt.compare(password, user.password);
		if (!isPasswordEquals) {
			throw HttpError.badRequest('Неверный пароль');
		}

		const userDto: UserForTokensDto = new UserForTokensDto(user);
		const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async activate(activationLink: string): Promise<UserEntity> {
		const user: UserEntity | null = await prisma.user.findFirst({ where: { activationLink } });

		if (!user) {
			throw HttpError.badRequest('Некорректная ссылка активации');
		}

		return prisma.user.update({
			where: { id: user.id },
			data: { isActivated: true },
		});
	}

	async logout(refreshToken: string) {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('logout');
		}

		return TokenService.removeToken(refreshToken);
	}

	async refresh(refreshToken: string): Promise<IUserData> {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const userData: UserForTokensDto | null = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDB: ITokenEntity = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const user: UserEntity | null = await prisma.user.findFirst({ where: { id: userData.id } });

		if (!user) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const userDto: UserForTokensDto = new UserForTokensDto(user);
		const tokens: ITokenPair = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id as string, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async getAll(): Promise<UserEntity[]> {
		return prisma.user.findMany();
	}
}

export default new UserService();
