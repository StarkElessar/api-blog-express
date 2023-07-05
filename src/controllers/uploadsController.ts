import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

class UploadsController {
	upload(req: Request, res: Response, next: NextFunction) {
		const fileData: Express.Multer.File | undefined = req.file;

		if (!fileData) {
			return next(ApiError.badRequest('Не удалось загрузить файл'));
		}

		res.json({ url: `/uploads/${fileData.originalname}` });
	}
}

export default new UploadsController();
