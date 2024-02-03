import { ParamsDictionary } from 'express-serve-static-core';
import { Prisma } from '@prisma/client';

export interface ITokenParams extends ParamsDictionary {
	token: string;
}

export type TokenWithUserDataType = Prisma.TokenGetPayload<{
	include: { user: true }
}>;