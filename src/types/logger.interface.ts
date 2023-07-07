import { Logger } from 'tslog';

export interface ILogger {
	logger: Logger<Logger<any>>;

	log: (...args: unknown[]) => Promise<void>;
	error: (...args: unknown[]) => Promise<void>;
	warn: (...args: unknown[]) => Promise<void>;
}
