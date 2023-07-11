import { User } from '../services/prismaService';

export class UserForTokensDto {
	public id: string;
	public email: string;
	public isActivated: boolean;
	public role: string;

	constructor(model: User = <User>{}) {
		this.id = model.id;
		this.email = model.email;
		this.isActivated = model.isActivated;
		this.role = model.role;
	}
}
