export interface IHttpError {
	statusCode: number;
	errors: unknown[];
	context?: string;
}
