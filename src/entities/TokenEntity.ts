import { BaseEntity } from './UserEntity';

export interface ITokenEntity {
	id: string,
	refreshToken: string,
	userId: string
}

export class TokenEntity extends BaseEntity {
	refreshToken: string;
	userId: string;
}
