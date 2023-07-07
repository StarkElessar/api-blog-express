import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { IExeptionFilter } from '../types/exeptionFilter.interface';
import { ILogger } from '../types/logger.interface';

export class ExeptionFilter implements IExeptionFilter {
	logger: ILogger;

	constructor(logger: ILogger) {
		this.logger = logger;
	}

	async catch(err: Error | HttpError, req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		if (err instanceof HttpError) {
			await this.logger.error(`[${err.context}] Ошибка ${err.statusCode}: ${err.message}`);
			return res.status(err.statusCode).send({ err: err.message });
		}

		await this.logger.error(`${err.message}`);
		res.status(500).send({ err: err.message });
	}
}
