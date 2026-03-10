import { Router } from 'express';
import { loginController, changePasswordController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased limit for dev
  message: { success: false, message: "Too many attempts, please try again after 15 minutes" }
});

const loginSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(1, "Password is required"),
  }).refine(data => data.phone || data.email, {
    message: "Either phone or email must be provided",
    path: ["phone"],
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  })
});

/** POST /api/auth/login — Authenticate user and return JWT */
router.post('/login', authLimiter, validate(loginSchema), loginController);

/** PUT /api/auth/password — Change password (requires auth) */
router.put('/password', authMiddleware, authLimiter, validate(changePasswordSchema), changePasswordController);

export default router;

