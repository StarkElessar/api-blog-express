import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import { Server } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import logger from 'morgan';

import { MulterConfig } from './utils/MulterConfig';
import { TYPES } from './types';
import { ILogger } from './types/logger.interface';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { IUserController } from './types/userController.interface';
import { IAuthController } from './types/authController.interface';
import { IUploadsController } from './types/uploadsController.interface';
import { IConfigService } from './types/configService.interface';
import { PrismaService } from './services/PrismaService';
import { AuthMiddleware } from './middlewares/AuthMiddleware';

@injectable()
export class App {
	public app: Express;
	public server: Server;
	public port: number | string;
	public uploadsPath: string;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
		@inject(TYPES.MulterConfig) private multerConfig: MulterConfig,
		@inject(TYPES.AuthController) private authController: IAuthController,
		@inject(TYPES.UserController) private userController: IUserController,
		@inject(TYPES.UploadsController) private uploadsController: IUploadsController,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
	) {
		/**
		 * Load environment variables from .env file,
		 * where API keys and passwords are configured. dfs
		 * */
		dotenv.config();

		this.app = express();
		this.port = process.env.PORT || 4000;
		this.uploadsPath = path.join(__dirname, '../uploads');
	}

	/**
	 * Express configuration.
	 * */
	public useMiddlewares(): void {
		this.app.use(logger('dev'));
		this.app.use(cookieParser())
		this.app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }))
		this.app.use(express.json());

		const authMiddleware = new AuthMiddleware(this.configService.get('JWT_ACCESS'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));

		/**
		 * Путь к uploads: '/uploads'
		 * */
		this.app.use('/uploads', express.static(this.uploadsPath));
		this.app.use(multer({ storage: this.multerConfig.storage }).single('fileData'));
	}

	/**
	 * Routing.
	 * */
	public useRoutes(): void {
		this.app.use('/api/upload', this.uploadsController.router);
		this.app.use('/api/auth', this.authController.router);
		this.app.use('/api/user', this.userController.router);
	}

	public useExeptionFilters(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	/**
	 * Start Express server.
	 * */
	public async init(): Promise<void> {
		this.useMiddlewares();
		this.useRoutes();
		this.useExeptionFilters();

		await this.prismaService.connect();

		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}
}
