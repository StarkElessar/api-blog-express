import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

import { prisma } from './prismaService';
import MailService from './mailService';
import TokenService, { ITokenPairs } from './tokenService';
import ApiError from '../utils/apiError';
import UserDto from '../dtos/userDto';
import { UserEntity } from '../entities/UserEntity';
import { ITokenEntity } from '../entities/TokenEntity';
import { IUserData } from '../types/user.interface';

class UserService {
	async registration(email: string, password: string, role: string): Promise<IUserData> {
		const candidate: UserEntity | null = await prisma.user.findFirst({ where: { email } });

		if (candidate) {
			throw ApiError.badRequest(`Пользователь с таким почтовым адресом ${email} уже существует`);
		}

		const hashPassword: string = await bcrypt.hash(password, 10);
		const activationLink: string = uuid();
		const user: UserEntity = await prisma.user.create({
			data: {
				email,
				password: hashPassword,
				activationLink,
				role
			}
		});

		await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

		const userDto: UserDto = new UserDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });
		await TokenService.saveToken(userDto.id as string, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async login(email: string, password: string): Promise<IUserData> {
		const user: UserEntity | null = await prisma.user.findFirst({ where: { email } });
		if (!user) {
			throw ApiError.badRequest('Пользователь с таким email не найден');
		}

		const isPasswordEquals: boolean = await bcrypt.compare(password, user.password);
		if (!isPasswordEquals) {
			throw ApiError.badRequest('Неверный пароль');
		}

		const userDto: UserDto = new UserDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async activate(activationLink: string) {
		const user: UserEntity | null = await prisma.user.findFirst({ where: { activationLink } });

		if (!user) {
			throw ApiError.badRequest('Некорректная ссылка активации');
		}

		return prisma.user.update({
			where: { id: user.id },
			data: { isActivated: true },
		});
	}

	async logout(refreshToken: string) {
		if (!refreshToken) {
			throw ApiError.unAuthorizedError();
		}

		return TokenService.removeToken(refreshToken);
	}

	async refresh(refreshToken: string): Promise<IUserData> {
		if (!refreshToken) {
			throw ApiError.unAuthorizedError();
		}

		const userData: UserDto | null = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDB: ITokenEntity = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw ApiError.unAuthorizedError();
		}

		const user: UserEntity | null = await prisma.user.findFirst({ where: { id: userData.id } });

		if (!user) {
			throw ApiError.badRequest('Пользователь не найден');
		}

		const userDto: UserDto = new UserDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id as string, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async getAll(): Promise<UserEntity[]> {
		return prisma.user.findMany();
	}
}

export default new UserService();
