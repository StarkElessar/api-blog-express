import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';

import { DiTypes } from '../diTypes';
import { IConfigService } from '../types/configService.interface';
import { ILogger } from '../types/logger.interface';

@injectable()
export class ConfigService implements IConfigService {
	private readonly config: DotenvParseOutput;

	constructor(@inject(DiTypes.ILogger) private _logger: ILogger) {
		const result: DotenvConfigOutput = config();

		if (result.error) {
			this._logger.error('[ConfigService] Не удалось прочитать файл .env или он отсутствует');
			return;
		}

		this.config = <DotenvParseOutput>result.parsed;
		this._logger.log('[ConfigService] Конфигурация .env загружена')
	}

	get(key: string): string {
		return this.config[key];
	}
}
