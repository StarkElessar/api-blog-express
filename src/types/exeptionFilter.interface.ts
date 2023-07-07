import { NextFunction, Request, Response } from 'express';
import { ILogger } from './logger.interface';

export interface IExeptionFilter {
	logger: ILogger;
	catch: (err: Error, req: Request, res: Response, next: NextFunction) => Promise<Response | undefined>;
}
