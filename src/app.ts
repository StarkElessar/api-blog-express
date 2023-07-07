import express, { Express } from 'express';
import { Server } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import logger from 'morgan';

import { storage } from './utils/multerConfig';
import authRouter from './routes/authRoute';
import uploadsRouter from './routes/uploadsRouter';
import { ILogger } from './types/logger.interface';
import { IExeptionFilter } from './types/exeptionFilter.interface';
import { IUserController } from './types/userController.interface';

export class App {
	app: Express;
	server: Server;
	port: number | string;
	uploadsPath: string;
	logger: ILogger;
	exeptionFilter: IExeptionFilter;
	userController: IUserController;

	constructor(
		logger: ILogger,
		exeptionFilter: IExeptionFilter,
		userController: IUserController
	) {
		/**
		 * Load environment variables from .env file,
		 * where API keys and passwords are configured. dfs
		 * */
		dotenv.config();

		this.app = express();
		this.port = process.env.PORT || 4000;
		this.uploadsPath = path.join(__dirname, '../uploads');
		this.logger = logger;
		this.exeptionFilter = exeptionFilter;
		this.userController = userController;
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

	useExeptionFilters() {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	/**
	 * Routing.
	 * */
	useRoutes(): void {
		this.app.use('/auth', authRouter);
		this.app.use('/upload', uploadsRouter);
		this.app.use('/user', this.userController.router);
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
