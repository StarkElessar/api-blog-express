import { User } from '@prisma/client';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { IUserUpdate } from './userUpdate.interface';

export interface IUsersRepository {
	create: (user: UserRegisterDto) => Promise<User>;
	findOneById: (id: number) => Promise<User | null>
	findOneByEmail: (email: string) => Promise<User | null>;
	findOneByActivatedLink: (link: string) => Promise<User | null>;
	update: (id: number, data: IUserUpdate) => Promise<User | null>;
	updateUserByLink: (userId: number) => Promise<User | null>;
	findAll: () => Promise<User[] | null>;
}
