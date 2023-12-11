import { NextFunction, Request, Response } from 'express';

import { IBaseController } from './baseController.interface';
import { ITokenParams } from './index';

export interface IAuthController extends IBaseController {
	register: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	login: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	activate: (req: Request<ITokenParams>, res: Response, next: NextFunction) => Promise<void>;
	getCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>
	logout: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	refresh: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
	sendPasswordResetLink: (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => Promise<void>;
	resetPassword: (req: Request<ITokenParams>, res: Response, next: NextFunction) => Promise<void>;
	updatePasswordAfterReset: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}