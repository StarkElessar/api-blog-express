import { User } from '@prisma/client';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { IUserUpdate } from './userUpdate.interface';

export interface IUsersRepository {
	create: (user: UserRegisterDto) => Promise<User>;
	findOneByEmail: (email: string) => Promise<User | null>;
	findOneByActivatedLink: (link: string) => Promise<User | null>;
	update: (id: string, data: IUserUpdate) => Promise<User | null>;
	updateUserByLink: (userId: string) => Promise<User | null>;
	findAll: () => Promise<User[] | null>;
}
