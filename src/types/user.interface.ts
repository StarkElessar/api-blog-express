import UserDto from '../dtos/userDto';

export interface IUserData {
	user: UserDto;
	accessToken: string;
	refreshToken: string;
}
