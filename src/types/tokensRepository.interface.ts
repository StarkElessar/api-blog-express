import { Token } from '@prisma/client';

export interface ITokensRepository {
	findByUserId: (userId: string) => Promise<Token | null>;
	findByToken: (token: string) => Promise<Token | null>
	create: (userId: string, token: string) => Promise<Token | null>;
	update: (id: string, token: string) => Promise<Token | null>;
	delete: (id: string) => Promise<Token>;
}
