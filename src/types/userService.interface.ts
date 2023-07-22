import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { Token, User } from '@prisma/client';

import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { IUserData } from './user.interface';

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<User>;
	validateUser: (dto: UserLoginDto) => Promise<UserForTokensDto>;
	activate: (activationLink: string) => Promise<User | null>;
	sendPasswordResetLink: (email: string) => Promise<Token | null>;
	resetPassword: (token: string) => Promise<User>;
	refresh: (refreshToken: string) => Promise<IUserData>;
	updatePassword: (userId: number, password: string) => Promise<User | null> ;
	getAll: () => Promise<User[] | null>;
}
