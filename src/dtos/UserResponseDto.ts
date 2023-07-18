import { User } from '@prisma/client';

export class UserResponseDto {
	public id: number;
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
