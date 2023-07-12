import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';

import { TYPES } from '../types';
import { IConfigService } from '../types/configService.interface';
import { ILogger } from '../types/logger.interface';

@injectable()
export class ConfigService implements IConfigService {
	private readonly config: DotenvParseOutput;

	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		const result: DotenvConfigOutput = config();

		if (result.error) {
			this.logger.error('[ConfigService] Не удалось прочитать файл .env или он отсутствует');
			return;
		}

		this.config = <DotenvParseOutput>result.parsed;
		this.logger.log('[ConfigService] Конфигурация .env загружена')
	}

	get(key: string): string {
		return this.config[key];
	}
}
