import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { DiTypes } from '../diTypes';
import { IExeptionFilter } from '../types/exeptionFilter.interface';
import { ILogger } from '../types/logger.interface';
import { HttpError } from '../utils/HttpError';

@injectable()
export class ExeptionFilter implements IExeptionFilter {
	constructor(@inject(DiTypes.ILogger) private _logger: ILogger) { }

	async catch(err: Error | HttpError, req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		if (err instanceof HttpError) {
			this._logger.error(`[${err.context}] Ошибка ${err.statusCode}: ${err.message}`);
			return res.status(err.statusCode).json({
				message: err.message,
				errors: err.errors
			});
		}

		this._logger.error(`${err.message}`);
		res.status(500).send({ err: err.message });
	}
}
