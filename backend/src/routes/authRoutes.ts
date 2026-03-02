import { Router } from 'express';
import { loginController, changePasswordController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased limit for dev
  message: { success: false, message: "Too many attempts, please try again after 15 minutes" }
});

/** POST /api/auth/login — Authenticate user and return JWT */
router.post('/login', authLimiter, loginController);

/** PUT /api/auth/password — Change password (requires auth) */
router.put('/password', authMiddleware, authLimiter, changePasswordController);

export default router;

