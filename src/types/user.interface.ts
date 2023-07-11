import { UserForTokensDto } from '../dtos/UserForTokensDto';

export interface IUserLoginData {
	email: string;
	password: string;
}

export interface IUserRegData extends IUserLoginData {
	role: string | undefined;
}

export interface IUserData {
	user: UserForTokensDto;
	accessToken: string;
	refreshToken: string;
}
