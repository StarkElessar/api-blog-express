import { User } from '../services/prismaService';

export class UserRegisterDto {
	public email: string;
	public id: string;
	public isActivated: boolean;
	public role: string;

	constructor(model: User) {
		this.email = model.email;
		this.id = model.id;
		this.isActivated = model.isActivated;
		this.role = model.role;
	}
}
