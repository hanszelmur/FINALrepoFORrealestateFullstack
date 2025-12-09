import { Router } from 'express';
import * as authController from '../controllers/authController';

const router: Router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);

export default router;
