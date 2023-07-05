import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';

export const storage: multer.StorageEngine = multer.diskStorage({
	destination: (req, file: Express.Multer.File, cb): void => {
		if (!existsSync('uploads')) {
			mkdirSync('uploads');
		}

		cb(null, 'uploads');
	},
	filename: (req, file: Express.Multer.File, cb): void => {
		cb(null, file.originalname);
	}
});
