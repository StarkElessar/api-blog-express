import { IsEmail } from 'class-validator';

export class EmailValidationDto {
	@IsEmail({}, { message: 'Не верный формат почты' })
	public email: string;
}