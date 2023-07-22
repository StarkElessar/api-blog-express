import { MinLength } from 'class-validator';

export class UserUpdatePasswordDto {
	@MinLength(5, { message: 'Пароль должен быть минимум 5 символов' })
	public password: string;

	@MinLength(5, { message: 'Пароль должен быть минимум 5 символов' })
	public confirmPassword: string;
}
