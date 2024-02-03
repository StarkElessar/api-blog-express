import { Container } from 'inversify';

import { IConfigService } from '../types/configService.interface';
import { IUsersRepository } from '../types/usersRrepository.interface';
import { IUserService } from '../types/userService.interface';
import { DiTypes } from '../diTypes';
import { UserService } from '../services/UserService';

const ConfigServiceMock: IConfigService = {
	get: jest.fn()
};

const UserRepositoryMock: IUsersRepository = {
	create: jest.fn(),
	findOneById: jest.fn(),
	findAll: jest.fn(),
	findOneByEmail: jest.fn(),
	update: jest.fn(),
	updateUserByLink: jest.fn()
};

const container = new Container();

let configService: IConfigService;
let usersRepository: IUsersRepository;
let userService: IUserService;

beforeAll(() => {
	container.bind<IUserService>(DiTypes.UserService).to(UserService);
	container.bind<IConfigService>(DiTypes.ConfigService).toConstantValue(ConfigServiceMock);
	container.bind<IUsersRepository>(DiTypes.UsersRepository).toConstantValue(UserRepositoryMock);

	configService = container.get<IConfigService>(DiTypes.ConfigService);
	usersRepository = container.get<IUsersRepository>(DiTypes.UsersRepository);
	userService = container.get<IUserService>(DiTypes.UserService);
});

const userDataToRegister = {
	email: 'test@gmail.com',
	password: '123456',
	confirmPassword: '123456',
}

describe('User Service', () => {
	it('createUser', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1');
		const createdUser = await userService.createUser(userDataToRegister);
	});
});

