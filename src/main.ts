import path from 'path';
import { App } from './app';
import { LoggerService } from './utils/loggerService';
import { ExeptionFilter } from './middlewares/exeptionFilter';
import { UserController } from './controllers/usersController';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { ILogger } from './types/logger.interface';
import { IUserController } from './types/userController.interface';

async function bootstrap(): Promise<void> {
	const logger: ILogger = new LoggerService(path.join(__dirname, '../logs.txt'));
	const exeptionFilter: IExeptionFilter = new ExeptionFilter(logger);
	const userController: IUserController = new UserController(logger);

	const app: App = new App(
		logger,
		exeptionFilter,
		userController
	);

	await app.init();
}

bootstrap();
