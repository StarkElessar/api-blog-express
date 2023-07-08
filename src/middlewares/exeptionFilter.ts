import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { TYPES } from '../types';
import { IExeptionFilter } from '../types/exeptionFilter.interface';
import { ILogger } from '../types/logger.interface';
import { HttpError } from '../utils/httpError';

@injectable()
export class ExeptionFilter implements IExeptionFilter {
	constructor(@inject(TYPES.ILogger) private logger: ILogger) { }

	async catch(err: Error | HttpError, req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		if (err instanceof HttpError) {
			await this.logger.error(`[${err.context}] Ошибка ${err.statusCode}: ${err.message}`);
			return res.status(err.statusCode).send({ err: err.message });
		}

		await this.logger.error(`${err.message}`);
		res.status(500).send({ err: err.message });
	}
}
