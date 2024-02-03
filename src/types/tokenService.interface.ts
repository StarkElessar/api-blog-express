import { Token } from '@prisma/client';

import { ITokenPair } from './tokenPair';
import { GenerateTokenDto } from '../dtos/GenerateTokenDto';
import { BaseDto } from '../dtos/BaseDto';

export interface ITokenService {
	generateToken<T extends GenerateTokenDto>(payload: T): Promise<string>;
	generateTokens: (id: number) => Promise<ITokenPair>;
	validateToken: (token: string, secretKey: string) => Promise<BaseDto>;
	updateToken: (userId: number, refreshToken: string) => Promise<Token | null>;
	removeToken: (refreshToken: string) => Promise<Token>;
}