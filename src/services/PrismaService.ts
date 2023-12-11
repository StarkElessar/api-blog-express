import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';

import { DiTypes } from '../diTypes';
import { ILogger } from '../types/logger.interface';

@injectable()
export class PrismaService {
	public client: PrismaClient;

	constructor(@inject(DiTypes.ILogger) private _logger: ILogger) {
		this.client = new PrismaClient();
	}

	public async connect(): Promise<void> {
		try {
			await this.client.$connect();
			this._logger.log('[PrismaService] Успешно подключились к БД');
		} catch (error) {
			if (error instanceof Error) {
				this._logger.error(`[PrismaService] Ошибка подключения к БД ${error.message}`);
			}
		}
	}

	public async disconnect(): Promise<void> {
		await this.client.$disconnect();
	}
}
