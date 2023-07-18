import { BaseEntity } from './BaseEntity';

export interface ITokenEntity {
	id: number,
	refreshToken: string,
	userId: string
}

export class TokenEntity extends BaseEntity {
	public refreshToken: string;
	public userId: number;
}
