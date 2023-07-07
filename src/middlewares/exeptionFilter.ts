import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { IExeptionFilter } from '../types/exeptionFilter.interface';
import { ILoggerService } from '../types/loggerService.interface';

export class ExeptionFilter implements IExeptionFilter {
	logger: ILoggerService;

	constructor(logger: ILoggerService) {
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
