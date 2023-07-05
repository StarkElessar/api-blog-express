import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import TokenService from '../services/tokenService';
import UserDto from '../dtos/userDto';

export default (req: Request, res: Response, next: NextFunction) => {
	try {
		const authorizationHeader = req.headers.authorization;
		if (!authorizationHeader) {
			return next(ApiError.noAccess());
		}

		const [ _, accessToken ] = authorizationHeader.split(' ');
		if (!accessToken) {
			return next(ApiError.noAccess());
		}

		const userData: UserDto | null = TokenService.validateAccessToken(accessToken);
		if (!userData) {
			return next(ApiError.noAccess());
		}

		req.user = userData;
		next();
	} catch (error) {
		return next(ApiError.noAccess());
	}
}
