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

	// TODO: переименовать на 'getById'
	public async findOneById(id: number): Promise<User | null> {
		return this.prismaService.client.user.findUnique({
			where: { id }
		});
	}

	// TODO: переименовать на 'getByEmail'
	public async findOneByEmail(email: string): Promise<User | null> {
		return this.prismaService.client.user.findUnique({
			where: { email }
		});
	}

	// TODO: удалиться и поиск будет по id
	public async findOneByActivatedLink(link: string): Promise<User | null> {
		return this.prismaService.client.user.findFirst({
			where: { activationLink: link }
		});
	}

	// TODO: выпилить и заменить на обычный метод update
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

	// TODO: переименовать на 'getAll'
	public async findAll(): Promise<User[] | null> {
		return this.prismaService.client.user.findMany();
	}
}
