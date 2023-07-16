import { Token } from '@prisma/client';

import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { ITokenPair } from './tokenPair';

export interface ITokenService {
	generateTokens: (payload: UserForTokensDto) => Promise<ITokenPair>;
	validateAccessToken: (token: string) => UserForTokensDto | null;
	validateRefreshToken: (token: string) => UserForTokensDto | null;
	saveToken: (userId: string, refreshToken: string) => Promise<Token | null>;
	removeToken: (refreshToken: string) => Promise<Token>;
	findToken: (refreshToken: string) => Promise<Token>
}
