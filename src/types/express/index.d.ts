import { UserForTokensDto } from '../../dtos/UserForTokensDto';

declare global {
	namespace Express {
		interface Request {
			user: string;
		}
	}
}
