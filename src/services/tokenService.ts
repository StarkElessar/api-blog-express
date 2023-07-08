import jwt from 'jsonwebtoken';
import { prisma } from './prismaService';
import { UserRegisterDto } from '../dtos/userRegister.dto';
import { TokenEntity } from '../entities/TokenEntity';
import { HttpError } from '../utils/httpError';

export interface ITokenPairs {
	accessToken: string;
	refreshToken: string;
}

class TokenService {
	generateTokens(payload: UserRegisterDto): ITokenPairs {
		const accessToken: string = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
			expiresIn: '30m',
		});

		const refreshToken: string = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
			expiresIn: '30d',
		});

		return {
			accessToken,
			refreshToken,
		};
	}

	validateAccessToken(token: string): UserRegisterDto | null {
		try {
			return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as UserRegisterDto;
		} catch (error) {
			return null;
		}
	}

	validateRefreshToken(token: string): UserRegisterDto | null {
		try {
			return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as UserRegisterDto;
		} catch (error) {
			return null;
		}
	}

	async saveToken(userId: string, refreshToken: string) {
		const tokenData: TokenEntity | null = await prisma.token.findFirst({ where: { userId } });

		if (tokenData) {
			return prisma.token.update({
				where: { id: tokenData.id },
				data: { refreshToken },
			});
		}

		return prisma.token.create({ data: { userId, refreshToken } });
	}

	async removeToken(refreshToken: string) {
		const data: TokenEntity | null = await prisma.token.findFirst(refreshToken as any);
		return prisma.token.delete({ where: { id: data?.id } });
	}

	async findToken(refreshToken: string): Promise<TokenEntity> {
		const tokenData: TokenEntity | null = await prisma.token.findFirst({ where: { refreshToken } });

		if (!tokenData) {
			throw HttpError.badRequest('Токен не найден');
		}

		return tokenData;
	}
}

export default new TokenService();
