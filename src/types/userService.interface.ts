import { Token, User } from '@prisma/client';

import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { UserLoginDto } from '../dtos/UserLoginDto';
import { UserForTokensDto } from '../dtos/UserForTokensDto';
import { UserDto } from '../dtos/UserDto';
import { IUserData } from './user.interface';

export interface IUserService {
	createUser: (dto: UserRegisterDto) => Promise<User>;
	validateUser: (dto: UserLoginDto) => Promise<UserForTokensDto>;
	activate: (id: number) => Promise<User | null>;
	validateUserForRequestActivationLink: (email: string) => Promise<User>;
	sendPasswordResetLink: (email: string) => Promise<Token | null>;
	resetPassword: (token: string) => Promise<User>;
	refresh: (refreshToken: string) => Promise<IUserData>;
	updatePassword: (userId: number, password: string) => Promise<User | null> ;
	getCurrentUser: (userId: number) => Promise<UserDto>;
	getAll: () => Promise<User[] | null>;
}
