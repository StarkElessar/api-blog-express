import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { existsSync, mkdirSync } from 'fs';
import { StorageEngine, diskStorage } from 'multer';

import { DiTypes } from '../diTypes';
import { ILogger } from '../types/logger.interface';

@injectable()
export class MulterConfig {
	private readonly _storage: StorageEngine;

	constructor(@inject(DiTypes.ILogger) private _logger: ILogger) {
		this._storage = diskStorage({
			destination: (req, file: Express.Multer.File, cb): void => {
				if (!existsSync('uploads')) {
					mkdirSync('uploads');
				}

				cb(null, 'uploads');
			},
			filename: (req, file: Express.Multer.File, cb): void => {
				cb(null, file.originalname);
			}
		});
	}

	public get storage() {
		this._logger.log(`[multer] запущен`);
		return this._storage;
	}
}
