import { Container, ContainerModule, interfaces } from 'inversify';
import path from 'path';

import { App } from './App';
import { DiTypes } from './diTypes';
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
type BootstrapFuncType = { appContainer: Container, app: App };

export const appBindings: ContainerModule = new ContainerModule((bind: interfaces.Bind): void => {
	bind<ILogger>(DiTypes.ILogger).toDynamicValue(() => new LoggerService(logFilePath)).inSingletonScope();
	bind<IExeptionFilter>(DiTypes.ExeptionFilter).to(ExeptionFilter).inSingletonScope();
	bind<MulterConfig>(DiTypes.MulterConfig).to(MulterConfig).inSingletonScope();
	bind<IAuthController>(DiTypes.AuthController).to(AuthController).inSingletonScope();
	bind<IUserController>(DiTypes.UserController).to(UserController).inSingletonScope();
	bind<IUploadsController>(DiTypes.UploadsController).to(UploadsController).inSingletonScope();
	bind<IUserService>(DiTypes.UserService).to(UserService).inSingletonScope();
	bind<IConfigService>(DiTypes.ConfigService).to(ConfigService).inSingletonScope();
	bind<PrismaService>(DiTypes.PrismaService).to(PrismaService).inSingletonScope();
	bind<ITokenService>(DiTypes.TokenService).to(TokenService).inSingletonScope();
	bind<IMailService>(DiTypes.MailService).to(MailService);
	bind<ICookieService>(DiTypes.CookieService).to(CookieService);
	bind<IUsersRepository>(DiTypes.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<ITokensRepository>(DiTypes.TokensRepository).to(TokensRepository).inSingletonScope();
	bind<App>(DiTypes.Application).to(App);
});

function bootstrap(): BootstrapFuncType {
	const appContainer: Container = new Container();
	appContainer.load(appBindings);
	const app: App = appContainer.get<App>(DiTypes.Application);
	app.init();

	return { appContainer, app };
}

export const { appContainer, app} = bootstrap();
