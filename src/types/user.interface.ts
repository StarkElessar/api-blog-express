import UserDto from '../dtos/user.dto';

export interface IUserLoginData {
	email: string;
	password: string;
}

export interface IUserRegData extends IUserLoginData {
	role: string | undefined;
}

export interface IUserData {
	user: UserDto;
	accessToken: string;
	refreshToken: string;
}
