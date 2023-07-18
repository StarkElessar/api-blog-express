import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { User } from '@prisma/client';

import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { IUserData } from './user.interface';

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<User | null>;
	validateUser: (dto: UserLoginDto) => Promise<UserForTokensDto | null>;
	activate: (activationLink: string) => Promise<User | null>;
	sendPasswordResetLink: (email: string) => Promise<User | null>;
	resetPassword: (link: string) => Promise<User>;
	refresh: (refreshToken: string) => Promise<IUserData>;
	getAll: () => Promise<User[] | null>;
}
