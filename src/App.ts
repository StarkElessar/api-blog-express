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
import { DiTypes } from './diTypes';
import { ILogger } from './types/logger.interface';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { IUserController } from './types/userController.interface';
import { IAuthController } from './types/authController.interface';
import { IUploadsController } from './types/uploadsController.interface';
import { IConfigService } from './types/configService.interface';
import { PrismaService } from './services';
import { AuthMiddleware } from './middlewares/AuthMiddleware';

@injectable()
export class App {
	public app: Express;
	public server: Server;
	public port: number | string;
	public uploadsPath: string;

	constructor(
		@inject(DiTypes.ILogger) private _logger: ILogger,
		@inject(DiTypes.ExeptionFilter) private _exceptionFilter: IExeptionFilter,
		@inject(DiTypes.MulterConfig) private _multerConfig: MulterConfig,
		@inject(DiTypes.AuthController) private _authController: IAuthController,
		@inject(DiTypes.UserController) private _userController: IUserController,
		@inject(DiTypes.UploadsController) private _uploadsController: IUploadsController,
		@inject(DiTypes.ConfigService) private _configService: IConfigService,
		@inject(DiTypes.PrismaService) private _prismaService: PrismaService,
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
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

		const authMiddleware = new AuthMiddleware(this._configService.get('JWT_ACCESS'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));

		/**
		 * Путь к uploads: '/uploads'
		 * */
		this.app.use('/uploads', express.static(this.uploadsPath));
		this.app.use(multer({ storage: this._multerConfig.storage }).single('fileData'));
	}

	/**
	 * Routing.
	 * */
	public useRoutes(): void {
		this.app.use('/api/upload', this._uploadsController.router);
		this.app.use('/api/auth', this._authController.router);
		this.app.use('/api/user', this._userController.router);
	}

	public useExeptionFilters(): void {
		this.app.use(this._exceptionFilter.catch.bind(this._exceptionFilter));
	}

	/**
	 * Start Express server.
	 * */
	public async init(): Promise<void> {
		this.useMiddlewares();
		this.useRoutes();
		this.useExeptionFilters();

		await this._prismaService.connect();

		this.server = this.app.listen(this.port, () => {
			this._logger.log(`Сервер запущен на http://localhost:${this.port}`);
		});
		this.server.maxConnections = 10000;
	}
}
