import { Response } from 'express';

export interface ICookieService {
	save: (res: Response, key: string, token: string) => void;
	delete: (res: Response, key: string) => void;
}
