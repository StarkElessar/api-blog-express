import express, { Router } from 'express';
import authController from '../controllers/authController';
import { registerValidation } from '../validations/auth';
import validationErrors from '../middlewares/validationErrors';
import checkAuth from '../middlewares/checkAuth';

const router: Router = express.Router();

router.post('/register', registerValidation, validationErrors, authController.register);
router.post('/login', registerValidation, validationErrors, authController.login);
router.get('/logout', authController.logout);
router.get('/refresh', authController.refresh);
router.get('/activate/:link', authController.activate);
router.get('/all', checkAuth, authController.getAll);

export default router;
