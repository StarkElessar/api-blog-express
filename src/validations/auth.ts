import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
	body('email', 'Не верный формат почты').isEmail(),
	body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 })
];
