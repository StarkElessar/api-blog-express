import path from 'path';
import { App } from './app';
import { LoggerService } from './utils/loggerService';

async function bootstrap(): Promise<void> {
	const logger: LoggerService = new LoggerService(path.join(__dirname, '../logs.txt'));
	const app: App = new App(logger);

	await app.init();
}

bootstrap();
