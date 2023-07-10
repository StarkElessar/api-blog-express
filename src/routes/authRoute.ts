// import express, { Router } from 'express';
// import { AuthController } from '../controllers/authController';
// import { registerValidation } from '../validations/auth';
// import validationErrors from '../middlewares/validationErrors';
// import checkAuth from '../middlewares/checkAuth';
// import { LoggerService } from '../utils/loggerService';
//
// const router: Router = express.Router();
// // TODO: удалить этот бред
// const logger = new LoggerService('sda');
// const authController = new AuthController(logger);
//
// router.post('/register', registerValidation, validationErrors, authController.register);
// router.post('/login', registerValidation, validationErrors, authController.login);
// router.get('/logout', authController.logout);
// router.get('/refresh', authController.refresh);
// router.get('/activate/:link', authController.activate);
// router.get('/all', checkAuth, authController.getAll);
//
// export default router;
