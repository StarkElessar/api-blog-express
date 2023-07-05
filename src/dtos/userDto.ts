import { UserEntity } from '../entities/UserEntity';

export default class UserDto {
	email: string;
	id: string;
	isActivated: boolean;
	role: string;

	constructor(model: UserEntity) {
		this.email = model.email;
		this.id = model.id;
		this.isActivated = model.isActivated;
		this.role = model.role;
	}
}
