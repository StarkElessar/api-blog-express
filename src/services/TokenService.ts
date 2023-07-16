import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { Token } from '@prisma/client';

import { HttpError } from '../utils/HttpError';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { ITokenService } from '../types/tokenService.interface';
import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { TokensRepository } from '../repositories/TokensRepository';
import { ITokenPair } from '../types/tokenPair';


@injectable()
export class TokenService implements ITokenService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.TokensRepository) private tokensRepository: TokensRepository,
		) {}

	private signJWT(payload: UserForTokensDto, secret: string, expires: string | number): Promise<string> {
		return new Promise((resolve, reject): void => {
			sign({ ...payload }, secret, { algorithm: 'HS256', expiresIn: expires }, (err, token) => {
				if (err) {
					reject(err);
				}

				resolve(<string>token);
			});
		});
	}

	public async generateTokens(payload: UserForTokensDto): Promise<ITokenPair> {
		const accessToken: string = await this.signJWT(payload, this.configService.get('JWT_ACCESS'), '30m');
		const refreshToken: string = await this.signJWT(payload, this.configService.get('JWT_REFRESH'), '30d');

		return {
			accessToken,
			refreshToken,
		};
	}

	public validateAccessToken(token: string): UserForTokensDto | null {
		return <UserForTokensDto>verify(token, this.configService.get('JWT_ACCESS'));
	}

	public validateRefreshToken(token: string): UserForTokensDto | null {
		return <UserForTokensDto>verify(token, this.configService.get('JWT_REFRESH'));
	}

	public async saveToken(userId: string, refreshToken: string): Promise<Token | null> {
		const tokenData: Token | null = await this.tokensRepository.findByUserId(userId);

		if (tokenData) {
			return this.tokensRepository.update(tokenData.id, refreshToken);
		}

		return this.tokensRepository.create(userId, refreshToken);
	}

	async removeToken(refreshToken: string): Promise<Token> {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('logout');
		}

		const data: Token | null = await this.tokensRepository.findByToken(refreshToken);

		if (!data) {
			throw HttpError.badRequest('Токен не найден');
		}

		return this.tokensRepository.delete(data.id);
	}

	async findToken(refreshToken: string): Promise<Token> {
		const tokenData: Token | null = await this.tokensRepository.findByToken(refreshToken);

		if (!tokenData) {
			throw HttpError.badRequest('Токен не найден');
		}

		return tokenData;
	}
}
