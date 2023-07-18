export interface IUserUpdate {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	age?: number;
	isActivated?: boolean;
	activationLink?: string;
	role?: 'user' | 'admin';
}
