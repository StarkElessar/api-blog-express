import { Response, Router } from 'express';

export interface IBaseController {
	router: Router;
	send<T>(res: Response, code: number, message: T): Response;
	ok<T>(res: Response, message: T): Response;
	created(res: Response): Response;
}
