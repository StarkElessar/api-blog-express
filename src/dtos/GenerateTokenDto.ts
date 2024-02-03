export type PayloadType = { [key: string]: string | number };

export interface IGenerateToken {
	secretKey: string;
	expires: string;
	payload: PayloadType;
}

export class GenerateTokenDto {
	public secretKey: string;
	public expires: string;
	public payload: PayloadType;

	constructor({ secretKey, expires, payload }: IGenerateToken) {
		this.secretKey = secretKey;
		this.expires = expires;
		this.payload = payload;
	}
}