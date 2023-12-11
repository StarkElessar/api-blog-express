import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { Token } from '@prisma/client';

import { HttpError } from '../utils/HttpError';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { ITokenService } from '../types/tokenService.interface';
import { DiTypes } from '../diTypes';
import { IConfigService } from '../types/configService.interface';
import { TokensRepository } from '../repositories/TokensRepository';
import { ITokenPair } from '../types/tokenPair';


@injectable()
export class TokenService implements ITokenService {
	constructor(
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
		@inject(DiTypes.TokensRepository) private _tokensRepository: TokensRepository,
	) {
	}

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
		const accessToken: string = await this.signJWT(payload, this._configService.get('JWT_ACCESS'), '30m');
		const refreshToken: string = await this.signJWT(payload, this._configService.get('JWT_REFRESH'), '30d');

		return {
			accessToken,
			refreshToken,
		};
	}

	public async generateResetToken(payload: UserForTokensDto): Promise<string> {
		return this.signJWT(payload, this._configService.get('JWT_ACCESS'), '10m');
	}

	public validateToken(token: string, secretKey: string): Promise<UserForTokensDto> {
		return new Promise((resolve, reject) => {
			verify(token, secretKey, (err, decoded) => {
				if (err) {
					switch (err.message) {
						case 'jwt expired':
							reject(HttpError.unprocessableEntity('TokenValidate', 'Срок действия токена вышел', [err.message]));
							break;
						case 'invalid signature':
							reject(HttpError.unprocessableEntity('TokenValidate', 'Токен не валидный', [err.message]));
							break;
						default:
							reject(HttpError.unprocessableEntity('TokenValidate', 'При валидации токена произошла ошибка', [err.message]));
							break;
					}
				}

				resolve(<UserForTokensDto>decoded);
			})
		});
	}

	public async updateToken(userId: number, refreshToken: string): Promise<Token | null> {
		const tokenData: Token | null = await this._tokensRepository.findByUserId(userId);

		if (tokenData) {
			return this._tokensRepository.update(tokenData.id, refreshToken);
		}

		return this._tokensRepository.create(userId, refreshToken);
	}

	public async removeToken(refreshToken: string): Promise<Token> {
		if (!refreshToken) {
			throw HttpError.unAuthorizedError('logout');
		}

		const data: Token | null = await this._tokensRepository.findByToken(refreshToken);

		if (!data) {
			throw HttpError.badRequest('Токен не найден');
		}

		return this._tokensRepository.delete(data.id);
	}
}
