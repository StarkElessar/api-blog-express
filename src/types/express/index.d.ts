import UserDto from '../../dtos/user.dto';

declare global {
	namespace Express {
		interface Request {
			user: UserDto;
		}
	}
}
