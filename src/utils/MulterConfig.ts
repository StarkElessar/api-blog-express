import 'reflect-metadata';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { inject, injectable } from 'inversify';

import { TYPES } from '../types';
import { ILogger } from '../types/logger.interface';

@injectable()
export class MulterConfig {
	private readonly _storage: multer.StorageEngine;

	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		this._storage = multer.diskStorage({
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
		this.logger.log(`[multer] запущен`);
		return this._storage;
	}
}
