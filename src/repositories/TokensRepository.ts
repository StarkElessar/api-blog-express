import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Token } from '@prisma/client';

import { DiTypes } from '../diTypes';
import { PrismaService } from '../services/PrismaService';
import { ITokensRepository } from '../types/tokensRepository.interface';

@injectable()
export class TokensRepository implements ITokensRepository {
	constructor(@inject(DiTypes.PrismaService) private _prismaService: PrismaService) {
	}

	public create(userId: number, token: string): Promise<Token | null> {
		return this._prismaService.client.token.create({ data: { userId, refreshToken: token } });
	}

	public update(id: number, token: string): Promise<Token | null> {
		return this._prismaService.client.token.update({
			where: { id },
			data: { refreshToken: token },
		});
	}

	public delete(id: number): Promise<Token> {
		return this._prismaService.client.token.delete({ where: { id } });
	}

	public findByUserId(userId: number): Promise<Token | null> {
		return this._prismaService.client.token.findFirst({ where: { userId } });
	}

	public findByToken(token: string): Promise<Token | null> {
		return this._prismaService.client.token.findFirst({ where: { refreshToken: token } });
	}
}
