import chalk from 'chalk';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
	console.log(chalk.bgRed.black('Логирование в режиме разработки:\n'), err);
	console.log(chalk.bgRed.black('________________________________\n'));

	if (err instanceof ApiError) {
		return res.status(err.status).json({
			message: err.message,
			errors: err.errors
		});
	}

	return res.status(500).json({
		message: 'Непредвиденная ошибка',
		error: err.message,
		trace: err.stack,
	});
};
