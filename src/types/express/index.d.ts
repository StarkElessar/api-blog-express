import { UserRegisterDto } from '../../dtos/userRegister.dto';

declare global {
	namespace Express {
		interface Request {
			user: UserRegisterDto;
		}
	}
}
