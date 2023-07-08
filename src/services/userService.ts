import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

import { prisma } from './prismaService';
import MailService from './mailService';
import TokenService, { ITokenPairs } from './tokenService';
import { HttpError } from '../utils/httpError';
import { UserRegisterDto } from '../dtos/userRegister.dto';
import { UserEntity } from '../entities/UserEntity';
import { ITokenEntity } from '../entities/TokenEntity';
import { IUserData, IUserLoginData, IUserRegData } from '../types/user.interface';

class UserService {
	async registration({ email, password, role = 'user' }: IUserRegData): Promise<IUserData> {
		const candidate: UserEntity | null = await prisma.user.findFirst({ where: { email } });

		if (candidate) {
			throw HttpError.badRequest(`Пользователь с таким почтовым адресом ${email} уже существует`);
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

		const userDto: UserRegisterDto = new UserRegisterDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });
		await TokenService.saveToken(userDto.id as string, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async login({ email, password }: IUserLoginData): Promise<IUserData> {
		const user: UserEntity | null = await prisma.user.findFirst({ where: { email } });
		if (!user) {
			throw HttpError.badRequest('Пользователь с таким email не найден');
		}

		const isPasswordEquals: boolean = await bcrypt.compare(password, user.password);
		if (!isPasswordEquals) {
			throw HttpError.badRequest('Неверный пароль');
		}

		const userDto: UserRegisterDto = new UserRegisterDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async activate(activationLink: string) {
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

		const userData: UserRegisterDto | null = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDB: ITokenEntity = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDB) {
			throw HttpError.unAuthorizedError('refresh');
		}

		const user: UserEntity | null = await prisma.user.findFirst({ where: { id: userData.id } });

		if (!user) {
			throw HttpError.badRequest('Пользователь не найден');
		}

		const userDto: UserRegisterDto = new UserRegisterDto(user);
		const tokens: ITokenPairs = TokenService.generateTokens({ ...userDto });

		await TokenService.saveToken(userDto.id as string, tokens.refreshToken);

		return { ...tokens, user: userDto };
	}

	async getAll(): Promise<UserEntity[]> {
		return prisma.user.findMany();
	}
}

export default new UserService();
