import 'reflect-metadata';
import express, { Express } from 'express';
import { Server } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import logger from 'morgan';

import { storage } from './utils/multerConfig';
import uploadsRouter from './routes/uploadsRouter';
import { ILogger } from './types/logger.interface';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { IUserController } from './types/userController.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { IAuthController } from './types/authController.interface';

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number | string;
	uploadsPath: string;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
		@inject(TYPES.AuthController) private authController: IAuthController,
		@inject(TYPES.UserController) private userController: IUserController
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
	useMiddlewares(): void {
		this.app.use(logger('dev'));
		this.app.use(cookieParser())
		this.app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }))
		this.app.use(express.json());

		/**
		 * Путь к uploads: '/uploads'
		 * */
		this.app.use('/uploads', express.static(this.uploadsPath));
		this.app.use(multer({ storage }).single('fileData'));
	}

	useExeptionFilters(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	/**
	 * Routing.
	 * */
	useRoutes(): void {
		this.app.use('/upload', uploadsRouter);
		this.app.use('/auth', this.authController.router);
		//this.app.use('/user', this.userController.router);
	}

	/**
	 * Start Express server.
	 * */
	public async init(): Promise<void> {
		this.useMiddlewares();
		this.useRoutes();
		this.useExeptionFilters();

		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}
}
