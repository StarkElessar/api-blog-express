import { Request, Response, NextFunction } from 'express';
import {
	AlternativeValidationError, FieldValidationError,
	GroupedAlternativeValidationError, Result, UnknownFieldsError,
	validationResult
} from 'express-validator';
import { HttpError } from '../utils/HttpError';

export default (req: Request, res: Response, next: NextFunction) => {
	const errors: Result<AlternativeValidationError | GroupedAlternativeValidationError | UnknownFieldsError | FieldValidationError> = validationResult(req);

	if (!errors.isEmpty()) {
		return next(HttpError.badRequest('Ошибка при валидации', errors.array()));
	}

	next();
}
