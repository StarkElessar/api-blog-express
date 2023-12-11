import 'reflect-metadata';
import { injectable } from 'inversify';
import { Response, Router } from 'express';

import { IControllerRoute } from '../types/route.interface';
import { ILogger } from '../types/logger.interface';
import { IBaseController } from '../types/baseController.interface';

@injectable()
export abstract class BaseController implements IBaseController {
	private readonly _router: Router;

	constructor(private _logger: ILogger) {
		this._router = Router();
	}

	public get router(): Router {
		return this._router;
	}

	public send<T>(res: Response, code: number, message: T): Response {
		res.type('application/json');
		return res.status(code).json(message);
	}

	public ok<T>(res: Response, message: T): Response {
		return this.send<T>(res, 200, message);
	}

	public created(res: Response): Response {
		return res.sendStatus(201);
	}

	protected bindRoutes(routes: IControllerRoute[]): void {
		for (const route of routes) {
			const handler = route.func.bind(this);
			const middlewares = route.middlewares?.map((m) => m.execute.bind(m));
			const pipeline = middlewares ? [...middlewares, handler] : handler;

			this.router[route.method](route.path, pipeline);
			this._logger.log(`[${route.method}] ${route.path}`);
		}
	}
}
