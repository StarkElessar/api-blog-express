import 'reflect-metadata';
import { injectable } from 'inversify';
import { Logger } from 'tslog';
import * as fs from 'fs';

import { ILogger } from '../types/logger.interface';

@injectable()
export class LoggerService implements ILogger {
	public logger: Logger<Logger<any>>;

	constructor(private readonly _logFilePath: string) {
		this.logger = new Logger({
			stylePrettyLogs: true,
			type: 'pretty',
			prettyLogTimeZone: 'local'
		});
	}

	log(...args: unknown[]): void {
		this.logToFile('info', args);
	}

	error(...args: unknown[]): void {
		this.logToFile('error', args);
	}

	warn(...args: unknown[]): void {
		this.logToFile('warn', args);
	}

	private async logToFile(level: 'info' | 'error' | 'warn', args: unknown[]): Promise<void> {
		const timestamp: string = new Date().toLocaleString();
		const logMessage: string = `[${timestamp}] [${level.toUpperCase()}] ${args.join(' ')}`;

		this.logger[level](...args);

		if (!fs.existsSync(this._logFilePath)) {
			fs.writeFileSync(this._logFilePath, '');
		}

		try {
			await fs.promises.appendFile(this._logFilePath, logMessage + '\n');
		} catch (err) {
			this.logger.error('Failed to write log to file:', err);
		}
	}
}
