import { UserResponseDto } from '../dtos/UserResponseDto';

export interface IUserLoginData {
	email: string;
	password: string;
}

export interface IUserRegData extends IUserLoginData {
	role: string | undefined;
}

export interface IUserData {
	user: UserResponseDto;
	accessToken: string;
	refreshToken: string;
}
