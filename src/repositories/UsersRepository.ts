import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { User } from '@prisma/client';

import { TYPES } from '../types';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { PrismaService } from '../services/PrismaService';
import { UserRegisterDto } from '../dtos/UserRegisterDto';
import { IUserUpdate } from '../types/userUpdate.interface';

@injectable()
export class UsersRepository implements IUsersRepository {
	constructor(
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
	) {
	}

	public async create({ email, password, role }: UserRegisterDto): Promise<User> {
		return this.prismaService.client.user.create({
			data: {
				email,
				password,
				role
			}
		});
	}

	public async findOneById(id: number): Promise<User | null> {
		return this.prismaService.client.user.findUnique({
			where: { id }
		});
	}

	public async findOneByEmail(email: string): Promise<User | null> {
		return this.prismaService.client.user.findUnique({
			where: { email }
		});
	}

	public async findOneByActivatedLink(link: string): Promise<User | null> {
		return this.prismaService.client.user.findFirst({
			where: { activationLink: link }
		});
	}

	public async updateUserByLink(userId: number): Promise<User | null> {
		return this.prismaService.client.user.update({
			where: { id: userId },
			data: { isActivated: true },
		});
	}

	public async update(id: number, data: IUserUpdate): Promise<User | null> {
		return this.prismaService.client.user.update({
			where: { id },
			data: { ...data }
		});
	}

	public async findAll(): Promise<User[] | null> {
		return this.prismaService.client.user.findMany();
	}
}
