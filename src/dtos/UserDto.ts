import { User } from '@prisma/client';

export class UserDto {
	public id: number;
	public email: string;
	public createdAt: Date;
	public updatedAt: Date;
	public avatar: string | null;
	public firstName: string | null;
	public lastName: string | null;
	public age: number | null;
	public isActivated: boolean;
	public role: string;

	constructor(model: User = <User>{}) {
		this.id = model.id;
		this.email = model.email;
		this.createdAt = model.createdAt;
		this.updatedAt = model.updatedAt;
		this.avatar = model.avatar;
		this.firstName = model.firstName;
		this.lastName = model.lastName;
		this.age = model.age;
		this.isActivated = model.isActivated;
		this.role = model.role;
	}
}
