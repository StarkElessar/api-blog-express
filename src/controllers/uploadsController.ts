import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { HttpError } from '../utils/httpError';
import { TYPES } from '../types';
import { ILogger } from '../types/logger.interface';
import { BaseController } from './baseController';
import { IUploadsController } from '../types/uploadsController.interface';

@injectable()
export class UploadsController extends BaseController implements IUploadsController {
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		super(loggerService)

		this.bindRoutes([
			{ path: '/', method: 'post', func: this.upload },
		])
	}

	public upload(req: Request, res: Response, next: NextFunction): void {
		try {
			const fileData: Express.Multer.File | undefined = req.file;

			if (!fileData) {
				return next(HttpError.badRequest('Не удалось загрузить файл'));
			}

			res.json({ url: `/uploads/${fileData.originalname}` });
		} catch (error) {
			next(HttpError.badRequest('Ошибка при обработке запроса..'));
		}
	}
}
