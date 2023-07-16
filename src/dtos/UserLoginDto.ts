import { User } from '@prisma/client';

export class UserLoginDto {
	public email: string;
	public password: string;

	constructor(model: User = <User>{}) {
		this.email = model.email;
		this.password = model.password;
	}
}
