import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Token } from '@prisma/client';

import { TYPES } from '../types';
import { PrismaService } from '../services/PrismaService';
import { ITokensRepository } from '../types/tokensRepository.interface';

@injectable()
export class TokensRepository implements ITokensRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {
	}

	public create(userId: string, token: string): Promise<Token | null> {
		return this.prismaService.client.token.create({ data: { userId, refreshToken: token } });
	}

	public update(id: string, token: string): Promise<Token | null> {
		return this.prismaService.client.token.update({
			where: { id },
			data: { refreshToken: token },
		});
	}

	public delete(id: string): Promise<Token> {
		return this.prismaService.client.token.delete({ where: { id } });
	}

	public findByUserId(userId: string): Promise<Token | null> {
		return this.prismaService.client.token.findFirst({ where: { userId } });
	}

	public findByToken(token: string): Promise<Token | null> {
		return this.prismaService.client.token.findFirst({ where: { refreshToken: token } });
	}
}
