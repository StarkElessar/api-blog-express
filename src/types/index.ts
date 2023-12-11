import { ParamsDictionary } from 'express-serve-static-core';

export interface ITokenParams extends ParamsDictionary {
	token: string;
}