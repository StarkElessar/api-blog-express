import { Container, ContainerModule, interfaces } from 'inversify';
import path from 'path';

import { App } from './App';
import { TYPES } from './types';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { ILogger } from './types/logger.interface';
import { IUserController } from './types/userController.interface';
import { IAuthController } from './types/authController.interface';
import { LoggerService } from './services/LoggerService';
import { ExeptionFilter } from './middlewares/ExeptionFilter';
import { UserController } from './controllers/UsersController';
import { AuthController } from './controllers/AuthController';
import { UploadsController } from './controllers/UploadsController';
import { IUploadsController } from './types/uploadsController.interface';
import { MulterConfig } from './utils/MulterConfig';

const logFilePath: string = path.join(__dirname, '../logs.txt');

export const appBindings: ContainerModule = new ContainerModule((bind: interfaces.Bind): void => {
	bind<ILogger>(TYPES.ILogger).toDynamicValue(() => new LoggerService(logFilePath));
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	bind<MulterConfig>(TYPES.MulterConfig).to(MulterConfig);
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
