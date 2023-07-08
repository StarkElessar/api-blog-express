import { User } from '../services/prismaService';

export class UserLoginDto {
	public email: string;
	public password: string;

	constructor(model: User) {
		this.email = model.email;
		this.password = model.password;
	}
}
