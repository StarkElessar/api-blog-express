import { Response, Router } from 'express';
import { IControllerRoute } from '../types/route.interface';
import { ILogger } from '../types/logger.interface';
import { IBaseController } from '../types/baseController.interface';

export abstract class BaseController implements IBaseController {
	private readonly _router: Router;

	protected constructor(private logger: ILogger) {
		this._router = Router();
	}

	get router(): Router {
		return this._router;
	}

	public send<T>(res: Response, code: number, message: T): Response {
		res.type('application/json');
		return res.status(200).json(message);
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

			this.router[route.method](route.path, handler);
			this.logger.log(`[${route.method}] ${route.path}`);
		}
	}
}
