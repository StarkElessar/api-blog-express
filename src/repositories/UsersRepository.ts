import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { User } from '@prisma/client';

import { TYPES } from '../types';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { PrismaService } from '../services/PrismaService';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { ITokenService } from '../types/tokenService.interface';

@injectable()
export class UsersRepository implements IUsersRepository {
	constructor(
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
		@inject(TYPES.TokenService) private tokenService: ITokenService,
	) {}

	public async create({ email, password, role }: UserRegisterDto): Promise<User> {
		return this.prismaService.client.user.create({
			data: {
				email,
				password,
				role
			}
		});
	}

	public async findOne(email: string): Promise<User | null> {
		return this.prismaService.client.user.findUnique({
			where: { email }
		});
	}

	public async findAll(): Promise<User[] | null> {
		return this.prismaService.client.user.findMany();
	}
}
