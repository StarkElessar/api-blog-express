import path from 'path';
import { App } from './app';
import { LoggerService } from './utils/loggerService';
import { ExeptionFilter } from './middlewares/exeptionFilter';
import { UserController } from './controllers/usersController';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { ILogger } from './types/logger.interface';
import { IUserController } from './types/userController.interface';
import { AuthController } from './controllers/authController';
import { Container, interfaces } from 'inversify';
import { TYPES } from './types';
import { IAuthController } from './types/authController.interface';

async function bootstrap(): Promise<void> {
	const logFilePath: string = path.join(__dirname, '../logs.txt');
	const appContainer: Container = new Container();

	appContainer.bind<ILogger>(TYPES.ILogger).toDynamicValue(() => new LoggerService(logFilePath));
	appContainer.bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	appContainer.bind<IAuthController>(TYPES.AuthController).to(AuthController);
	appContainer.bind<IUserController>(TYPES.UserController).to(UserController);
	appContainer.bind<App>(TYPES.Application).to(App);

	const app: App = appContainer.get<App>(TYPES.Application);

	await app.init();
}

bootstrap();
