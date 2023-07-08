import { Container, ContainerModule, interfaces } from 'inversify';
import path from 'path';

import { App } from './app';
import { TYPES } from './types';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { ILogger } from './types/logger.interface';
import { IUserController } from './types/userController.interface';
import { IAuthController } from './types/authController.interface';
import { LoggerService } from './utils/loggerService';
import { ExeptionFilter } from './middlewares/exeptionFilter';
import { UserController } from './controllers/usersController';
import { AuthController } from './controllers/authController';
import { UploadsController } from './controllers/uploadsController';
import { IUploadsController } from './types/uploadsController.interface';

const logFilePath: string = path.join(__dirname, '../logs.txt');

export const appBindings: ContainerModule = new ContainerModule((bind: interfaces.Bind): void => {
	bind<ILogger>(TYPES.ILogger).toDynamicValue(() => new LoggerService(logFilePath));
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	bind<IAuthController>(TYPES.AuthController).to(AuthController);
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUploadsController>(TYPES.UploadsController).to(UploadsController);
	bind<App>(TYPES.Application).to(App);
});

function bootstrap(): { appContainer: Container, app: App } {
	const appContainer: Container = new Container();
	appContainer.load(appBindings);
	const app: App = appContainer.get<App>(TYPES.Application);
	app.init();

	return { appContainer, app };
}

export const { appContainer, app} = bootstrap();
