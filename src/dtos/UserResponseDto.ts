import { User } from '@prisma/client';
import { BaseDto } from './BaseDto';

export class UserResponseDto extends BaseDto {
	public email: string;
	public isActivated: boolean;
	public role: string;

	constructor(model: User = <User>{}) {
		super(model.id);

		this.email = model.email;
		this.isActivated = model.isActivated;
		this.role = model.role;
	}
}
