import { User } from '@prisma/client';
import { IsEmail, MinLength } from 'class-validator';

export class UserLoginDto {
	@IsEmail({}, { message: 'Не верный формат почты' })
	public email: string;

	@MinLength(5, { message: 'Пароль должен быть минимум 5 символов' })
	public password: string;

	constructor(model: User = <User>{}) {
		this.email = model.email;
		this.password = model.password;
	}
}
