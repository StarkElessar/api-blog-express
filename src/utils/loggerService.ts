import { Logger } from 'tslog';
import * as fs from 'fs';
import { ILogger } from '../types/logger.interface';

export class LoggerService implements ILogger {
	public logger: Logger<Logger<any>>;
	private readonly logFilePath: string;

	constructor(logFilePath: string) {
		this.logger = new Logger({
			stylePrettyLogs: true,
			type: 'pretty',
			prettyLogTimeZone: 'local'
		});

		this.logFilePath = logFilePath;
	}

	async log(...args: unknown[]): Promise<void> {
		await this.logToFile('info', args);
	}

	async error(...args: unknown[]): Promise<void> {
		await this.logToFile('error', args);
	}

	async warn(...args: unknown[]): Promise<void> {
		await this.logToFile('warn', args);
	}

	private async logToFile(level: 'info' | 'error' | 'warn', args: unknown[]): Promise<void> {
		const timestamp = new Date().toLocaleString();
		const logMessage =  `[${timestamp}] [${level.toUpperCase()}] ${args.join(' ')}`;

		this.logger[level](...args);

		if (!fs.existsSync(this.logFilePath)) {
			fs.writeFileSync(this.logFilePath, '');
		}

		try {
			await fs.promises.appendFile(this.logFilePath, logMessage + '\n');
		} catch (err) {
			this.logger.error('Failed to write log to file:', err);
		}
	}
}
