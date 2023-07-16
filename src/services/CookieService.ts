import 'reflect-metadata';
import { injectable } from 'inversify';
import { Response } from 'express';

import { ICookieService } from '../types/cookieService.interface';

@injectable()
export class CookieService implements ICookieService {
	public save(res: Response, key: string, token: string) {
		res.cookie(key, token, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: 'none'
		});
	}

	public delete(res: Response, key: string): void {
		res.clearCookie('refreshToken');
	}
}
