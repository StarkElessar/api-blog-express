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
import { IUserService } from './types/userService.interface';
import { UserService } from './services/UserService';
import { IConfigService } from './types/configService.interface';
import { ConfigService } from './services/ConfigService';
import { PrismaService } from './services/PrismaService';
import { UsersRepository } from './repositories/UsersRepository';
import { IUsersRepository } from './types/usersRrepository.interface';
import { ITokenService } from './types/tokenService.interface';
import { TokenService } from './services/TokenService';
import { ITokensRepository } from './types/tokensRepository.interface';
import { TokensRepository } from './repositories/TokensRepository';
import { MailService } from './services/MailService';
import { IMailService } from './types/mailService.interface';
import { CookieService } from './services/CookieService';
import { ICookieService } from './types/cookieService.interface';

const logFilePath: string = path.join(__dirname, '../logs.txt');

export const appBindings: ContainerModule = new ContainerModule((bind: interfaces.Bind): void => {
	bind<ILogger>(TYPES.ILogger).toDynamicValue(() => new LoggerService(logFilePath)).inSingletonScope();
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter).inSingletonScope();
	bind<MulterConfig>(TYPES.MulterConfig).to(MulterConfig).inSingletonScope();
	bind<IAuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
	bind<IUserController>(TYPES.UserController).to(UserController).inSingletonScope();
	bind<IUploadsController>(TYPES.UploadsController).to(UploadsController).inSingletonScope();
	bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<ITokenService>(TYPES.TokenService).to(TokenService).inSingletonScope();
	bind<IMailService>(TYPES.MailService).to(MailService);
	bind<ICookieService>(TYPES.CookieService).to(CookieService);
	bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<ITokensRepository>(TYPES.TokensRepository).to(TokensRepository).inSingletonScope();
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
