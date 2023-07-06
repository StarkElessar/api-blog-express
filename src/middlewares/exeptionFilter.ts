import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { LoggerService } from '../utils/loggerService';
import { IExeptionFilter } from '../types/exeptionFilter.interface';

export class ExeptionFilter implements IExeptionFilter {
	logger: LoggerService;

	constructor(logger: LoggerService) {
		this.logger = logger;
	}

	catch(err: Error | HttpError, req: Request, res: Response, next: NextFunction) {
		if (err instanceof HttpError) {
			this.logger.error(`[${err.context}] Ошибка ${err.statusCode}: ${err.message}`);
			return res.status(err.statusCode).send({ err: err.message });
		}

		this.logger.error(`${err.message}`);
		res.status(500).send({ err: err.message });
	}
}
