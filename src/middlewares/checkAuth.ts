import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import TokenService from '../services/tokenService';
import UserDto from '../dtos/userDto';

export default (req: Request, res: Response, next: NextFunction): void => {
	try {
		const authorizationHeader: string | undefined = req.headers.authorization;
		if (!authorizationHeader) {
			return next(HttpError.noAccess());
		}

		const [ _, accessToken ]: string[] = authorizationHeader.split(' ');
		if (!accessToken) {
			return next(HttpError.noAccess());
		}

		const userData: UserDto | null = TokenService.validateAccessToken(accessToken);
		if (!userData) {
			return next(HttpError.noAccess());
		}

		req.user = userData;
		next();
	} catch (error) {
		return next(HttpError.noAccess());
	}
}
