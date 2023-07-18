import { Token } from '@prisma/client';

import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { ITokenPair } from './tokenPair';

export interface ITokenService {
	generateTokens: (payload: UserForTokensDto) => Promise<ITokenPair>;
	validateToken: (token: string, secretKey: string) => UserForTokensDto | null;
	updateToken: (userId: number, refreshToken: string) => Promise<Token | null>;
	removeToken: (refreshToken: string) => Promise<Token>;
}
