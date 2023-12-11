import { IsEmail, MinLength } from 'class-validator';
import { User } from '@prisma/client';

export class UserRegisterDto {
	@IsEmail({}, { message: 'Не верный формат почты' })
	public email: string;

	@MinLength(5, { message: 'Пароль должен быть минимум 5 символов' })
	public password: string;

	@MinLength(5, { message: 'Пароль должен быть минимум 5 символов' })
	public confirmPassword: string;

	public role?: string;

	constructor(model: User = <User>{}) {
		this.email = model.email;
		this.password = model.password;
		this.role = model.role;
	}
}