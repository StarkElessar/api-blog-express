import jwt from 'jsonwebtoken';
import { prisma } from './prismaService';
import UserDto from '../dtos/userDto';
import { TokenEntity } from '../entities/TokenEntity';
import ApiError from '../utils/apiError';

export interface ITokenPairs {
	accessToken: string;
	refreshToken: string;
}

class TokenService {
	generateTokens(payload: UserDto): ITokenPairs {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
			expiresIn: '30m',
		});

		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
			expiresIn: '30d',
		});

		return {
			accessToken,
			refreshToken,
		};
	}

	validateAccessToken(token: string): UserDto | null {
		try {
			return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as UserDto;
		} catch (error) {
			return null;
		}
	}

	validateRefreshToken(token: string): UserDto | null {
		try {
			return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as UserDto;
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
			throw ApiError.badRequest('Токен не найден');
		}

		return tokenData;
	}
}

export default new TokenService();
