import { User } from '@prisma/client';
import { UserRegisterDto } from '../dtos/UserRegisterDto';

export interface IUsersRepository {
	create: (user: UserRegisterDto) => Promise<User>;
	findOne: (email: string) => Promise<User | null>;
	findAll: () => Promise<User[] | null>;
}
