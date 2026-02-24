import { Router } from 'express';
import { loginController, changePasswordController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/** POST /api/auth/login — Authenticate user and return JWT */
router.post('/login', loginController);

/** PUT /api/auth/password — Change password (requires auth) */
router.put('/password', authMiddleware, changePasswordController);

export default router;

