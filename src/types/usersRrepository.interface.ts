import { User } from '@prisma/client';

import { IUserUpdate } from './userUpdate.interface';
import { UserEntity } from '../entities/UserEntity';

export interface IUsersRepository {
	create: (user: UserEntity) => Promise<User>;
	findOneById: (id: number) => Promise<User | null>
	findOneByEmail: (email: string) => Promise<User | null>;
	update: (id: number, data: IUserUpdate) => Promise<User | null>;
	updateUserByLink: (userId: number) => Promise<User | null>
	findAll: () => Promise<User[] | null>;
}
