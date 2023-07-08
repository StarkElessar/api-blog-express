import { NextFunction, Request, Response } from 'express';
import { IBaseController } from './baseController.interface';

export interface IUploadsController extends IBaseController {
	upload: (req: Request, res: Response, next: NextFunction) => void;
}
