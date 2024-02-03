import { Container, ContainerModule, interfaces } from 'inversify';
import path from 'path';

import { App } from './App';
import { DiTypes } from './diTypes';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { ILogger } from './types/logger.interface';
import { IUserController } from './types/userController.interface';
import { IAuthController } from './types/authController.interface';
import { IUploadsController } from './types/uploadsController.interface';
import { IUserService } from './types/userService.interface';
import { IConfigService } from './types/configService.interface';
import { IUsersRepository } from './types/usersRrepository.interface';
import { ITokenService } from './types/tokenService.interface';
import { ITokensRepository } from './types/tokensRepository.interface';
import { IMailService } from './types/mailService.interface';
import { ICookieService } from './types/cookieService.interface';
import { ExeptionFilter } from './middlewares/ExeptionFilter';
import { MulterConfig } from './utils/MulterConfig';
import { LoggerService, CookieService, ConfigService, UserService, MailService, PrismaService, TokenService } from './services';
import { UserController, UploadsController, AuthController } from './controllers';
import { UsersRepository, TokensRepository } from './repositories';

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
	bind<IMailService>(DiTypes.MailService).to(MailService).inSingletonScope();
	bind<ICookieService>(DiTypes.CookieService).to(CookieService).inSingletonScope();
	bind<IUsersRepository>(DiTypes.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<ITokensRepository>(DiTypes.TokensRepository).to(TokensRepository).inSingletonScope();
	bind<App>(DiTypes.Application).to(App).inSingletonScope();
});

function bootstrap(): BootstrapFuncType {
	const appContainer: Container = new Container();
	appContainer.load(appBindings);
	const app: App = appContainer.get<App>(DiTypes.Application);
	app.init();

	return { appContainer, app };
}

export const { appContainer, app} = bootstrap();
