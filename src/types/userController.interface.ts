import { NextFunction, Request, Response } from 'express';
import { IBaseController } from './baseController.interface';

export interface IUserController extends IBaseController {
	register: (req: Request, res: Response, next: NextFunction) => void;
	login: (req: Request, res: Response, next: NextFunction) => void;
}
