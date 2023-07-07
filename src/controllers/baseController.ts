import { Response, Router } from 'express';
import { IControllerRoute } from '../types/route.interface';
import { ILoggerService } from '../types/loggerService.interface';

export abstract class BaseController {
	private readonly _router: Router;

	protected constructor(private logger: ILoggerService) {
		this._router = Router();
	}

	get router() {
		return this._router;
	}

	public send<T>(res: Response, code: number, message: T) {
		res.type('application/json');
		return res.status(200).json(message);
	}

	public ok<T>(res: Response, message: T) {
		return this.send<T>(res, 200, message);
	}

	public created(res: Response) {
		return res.sendStatus(201);
	}

	protected bindRoutes(routes: IControllerRoute[]) {
		for (const route of routes) {
			const handler = route.func.bind(this);

			this.router[route.method](route.path, handler);
			this.logger.log(`[${route.method}] ${route.path}`);
		}
	}
}
