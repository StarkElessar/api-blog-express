import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';

class UploadsController {
	upload(req: Request, res: Response, next: NextFunction): void {
		const fileData: Express.Multer.File | undefined = req.file;

		if (!fileData) {
			return next(HttpError.badRequest('Не удалось загрузить файл'));
		}

		res.json({ url: `/uploads/${fileData.originalname}` });
	}
}

export default new UploadsController();
