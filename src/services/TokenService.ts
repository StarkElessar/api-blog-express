import 'reflect-metadata';
import { injectable } from 'inversify';
import jwt, { sign } from 'jsonwebtoken';
import { TokenEntity } from '../entities/TokenEntity';
import { HttpError } from '../utils/HttpError';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { ITokenService } from '../types/tokenService.interface';

export interface ITokenPair {
	accessToken: string;
	refreshToken: string;
}

@injectable()
export class TokenService implements ITokenService {
	public signJWT(email: string, secret: string): Promise<string> {
		return new Promise((resolve, reject) => {
			sign({
				email,
				iat: Math.floor(Date.now() / 1000),
			}, secret, {
				algorithm: 'HS256'
			}, (err, token) => {
				if (err) {
					reject(err);
				}

				resolve(<string>token);
			});
		});
	}
	// generateTokens(payload: UserForTokensDto): ITokenPair {
	// 	const accessToken: string = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
	// 		expiresIn: '30m',
	// 	});
	//
	// 	const refreshToken: string = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
	// 		expiresIn: '30d',
	// 	});
	//
	// 	return {
	// 		accessToken,
	// 		refreshToken,
	// 	};
	// }
	//
	// validateAccessToken(token: string): UserForTokensDto | null {
	// 	try {
	// 		return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as UserForTokensDto;
	// 	} catch (error) {
	// 		return null;
	// 	}
	// }
	//
	// validateRefreshToken(token: string): UserForTokensDto | null {
	// 	try {
	// 		return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as UserForTokensDto;
	// 	} catch (error) {
	// 		return null;
	// 	}
	// }
	//
	// async saveToken(userId: string, refreshToken: string) {
	// 	const tokenData: TokenEntity | null = await this..token.findFirst({ where: { userId } });
	//
	// 	if (tokenData) {
	// 		return prisma.token.update({
	// 			where: { id: tokenData.id },
	// 			data: { refreshToken },
	// 		});
	// 	}
	//
	// 	return prisma.token.create({ data: { userId, refreshToken } });
	// }
	//
	// async removeToken(refreshToken: string) {
	// 	const data: TokenEntity | null = await prisma.token.findFirst(refreshToken as any);
	// 	return prisma.token.delete({ where: { id: data?.id } });
	// }
	//
	// async findToken(refreshToken: string): Promise<TokenEntity> {
	// 	const tokenData: TokenEntity | null = await prisma.token.findFirst({ where: { refreshToken } });
	//
	// 	if (!tokenData) {
	// 		throw HttpError.badRequest('Токен не найден');
	// 	}
	//
	// 	return tokenData;
	// }
}
