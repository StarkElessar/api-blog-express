import { User } from '@prisma/client';

export class UserForTokensDto {
	public id: number;

	constructor(model: User = <User>{}) {
		this.id = model.id;
	}
}
