import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { User } from '@prisma/client';

import { DiTypes } from '../diTypes';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { PrismaService } from '../services/PrismaService';
import { IUserUpdate } from '../types/userUpdate.interface';
import { UserEntity } from '../entities/UserEntity';

@injectable()
export class UsersRepository implements IUsersRepository {
	constructor(
		@inject(DiTypes.PrismaService) private _prismaService: PrismaService,
	) {
	}

	public async create(user: UserEntity): Promise<User> {
		return this._prismaService.client.user.create({
			data: {
				email: user.email,
				password: user.password,
				role: user.role
			}
		});
	}

	// TODO: переименовать на 'getById'
	public async findOneById(id: number): Promise<User | null> {
		return this._prismaService.client.user.findUnique({
			where: { id },
			include: {
				tokens: true,
			},
		});
	}

	// TODO: переименовать на 'getByEmail'
	public async findOneByEmail(email: string): Promise<User | null> {
		return this._prismaService.client.user.findUnique({
			where: { email }
		});
	}

	// TODO: выпилить и заменить на обычный метод update
	public async updateUserByLink(userId: number): Promise<User | null> {
		return this._prismaService.client.user.update({
			where: { id: userId },
			data: { isActivated: true },
		});
	}

	public async update(id: number, data: IUserUpdate): Promise<User | null> {
		return this._prismaService.client.user.update({
			where: { id },
			data: { ...data }
		});
	}

	// TODO: переименовать на 'getAll'
	public async findAll(): Promise<User[] | null> {
		return this._prismaService.client.user.findMany();
	}
}
