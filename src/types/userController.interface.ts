import { NextFunction, Request, Response } from 'express';
import { IBaseController } from './baseController.interface';

export interface IUserController extends IBaseController {
	getAll: (req: Request, res: Response, next: NextFunction) => void;
}
