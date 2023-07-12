import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { User } from '@prisma/client';
import { UserLoginDto } from '../dtos/UserLoginDto';

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<User | null>;
	validateUser: (dto: UserLoginDto) => Promise<boolean>;
	getAll: () => Promise<User[] | null>;
}
