import { UserRegisterDto } from '../dtos/userRegister.dto';

export interface IUserLoginData {
	email: string;
	password: string;
}

export interface IUserRegData extends IUserLoginData {
	role: string | undefined;
}

export interface IUserData {
	user: UserRegisterDto;
	accessToken: string;
	refreshToken: string;
}
