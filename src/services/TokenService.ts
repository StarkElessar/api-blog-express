import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { Token } from '@prisma/client';

import { HttpError } from '../utils/HttpError';
import { ITokenService } from '../types/tokenService.interface';
import { DiTypes } from '../diTypes';
import { IConfigService } from '../types/configService.interface';
import { TokensRepository } from '../repositories/TokensRepository';
import { ITokenPair } from '../types/tokenPair';
import { BaseDto } from '../dtos/BaseDto';
import { GenerateTokenDto } from '../dtos/GenerateTokenDto';
import { TokenWithUserDataType } from '../types';


@injectable()
export class TokenService implements ITokenService {
	constructor(
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
		@inject(DiTypes.TokensRepository) private _tokensRepository: TokensRepository,
	) {
	}

	public async generateToken<T extends GenerateTokenDto>({ expires, secretKey, payload }: T): Promise<string> {
		return new Promise((resolve, reject): void => {
			sign({ ...payload }, secretKey, { algorithm: 'HS256', expiresIn: expires }, (err, token) => {
				if (err) {
					reject(err);
				}

				resolve(<string>token);
			});
		});
	}

	public async generateTokens(id: number): Promise<ITokenPair> {
		const accessToken = await this.generateToken(new GenerateTokenDto({
			expires: '30m',
			secretKey: this._configService.get('JWT_ACCESS'),
			payload: { id }
		}));

		const refreshToken = await this.generateToken(new GenerateTokenDto({
			expires: '30d',
			secretKey: this._configService.get('JWT_REFRESH'),
			payload: { id }
		}));

		return {
			accessToken,
			refreshToken,
		};
	}

	public validateToken(token: string, secretKey: string): Promise<BaseDto> {
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

				resolve(<BaseDto>decoded);
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

		const data: TokenWithUserDataType | null = await this._tokensRepository.findByToken(refreshToken);

		if (!data) {
			throw HttpError.badRequest('Токен не найден');
		}

		return this._tokensRepository.delete(data.id);
	}
}