import { NextFunction, Request, Response } from 'express';
import { IBaseController } from './baseController.interface';

export interface IAuthController extends IBaseController {
	register: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	login: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	activate: (req: Request<{link: string}, {}, {}>, res: Response, next: NextFunction) => Promise<void>;
	logout: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	refresh: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
}
