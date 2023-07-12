export interface ITokenService {
	signJWT: (email: string, secret: string) => Promise<string>;
}
