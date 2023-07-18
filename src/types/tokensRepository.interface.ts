import { Token } from '@prisma/client';

export interface ITokensRepository {
	findByUserId: (userId: number) => Promise<Token | null>;
	findByToken: (token: string) => Promise<Token | null>
	create: (userId: number, token: string) => Promise<Token | null>;
	update: (id: number, token: string) => Promise<Token | null>;
	delete: (id: number) => Promise<Token>;
}
