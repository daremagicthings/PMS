import { Request, Response, NextFunction } from 'express';
import { login, LoginInput, changePassword, ChangePasswordInput } from '../services/authService';

/**
 * Controller for POST /api/auth/login
 * Validates input, delegates to authService, returns JWT token.
 *
 * Constitution: Controller only handles req/res — business logic is in authService.
 */
export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { phone, password } = req.body as LoginInput;

        if (!phone || !password) {
            res.status(400).json({
                success: false,
                message: 'Phone number and password are required',
            });
            return;
        }

        const result = await login({ phone, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('Invalid phone number or password')) {
            res.status(401).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for PUT /api/auth/password
 * Changes the authenticated user's password.
 * Requires authMiddleware to set req.user.
 *
 * Constitution: Controller only handles req/res — business logic is in authService.
 */
export const changePasswordController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        const { oldPassword, newPassword } = req.body as ChangePasswordInput;

        if (!oldPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'oldPassword and newPassword are required',
            });
            return;
        }

        const result = await changePassword(userId, { oldPassword, newPassword });

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('incorrect')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('at least')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

