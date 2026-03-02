import { Request, Response, NextFunction } from 'express';
import { createUser, getAllUsers, updatePushToken, CreateUserInput } from '../services/userService';

/**
 * Controller for POST /api/users
 * Creates a new user/resident and optionally links to an apartment.
 */
export const createUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreateUserInput;

        if (!input.name || !input.phone || !input.password) {
            res.status(400).json({
                success: false,
                message: 'name, phone, and password are required',
            });
            return;
        }

        const user = await createUser(input);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        // Handle unique constraint violations (duplicate phone/email)
        if (err.message.includes('Unique constraint')) {
            res.status(409).json({
                success: false,
                message: 'A user with this phone number or email already exists',
            });
            return;
        }
        next(err);
    }
};

/**
 * Controller for GET /api/users
 * Lists all users (Admin only — authorization to be added in future).
 */
export const getAllUsersController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/users/push-token
 * Registers the Expo push token for the authenticated user.
 * Requires authMiddleware to set req.user.
 */
export const updatePushTokenController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { token } = req.body as { token: string };

        if (!token) {
            res.status(400).json({
                success: false,
                message: 'token is required',
            });
            return;
        }

        // Basic validation — Expo push tokens start with ExponentPushToken[
        if (!token.startsWith('ExponentPushToken[')) {
            res.status(400).json({
                success: false,
                message: 'Invalid Expo push token format',
            });
            return;
        }

        await updatePushToken(userId, token);

        res.status(200).json({
            success: true,
            message: 'Push token registered successfully',
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/users/ebarimt-settings
 * Updates E-Barimt configurations (CITIZEN vs ENTITY and Registry Number).
 * Requires authMiddleware to set req.user.
 */
export const updateEbarimtSettingsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        const { ebarimtType, ebarimtRegNo } = req.body as { ebarimtType: string; ebarimtRegNo?: string };

        if (!ebarimtType || (ebarimtType !== 'CITIZEN' && ebarimtType !== 'ENTITY')) {
            res.status(400).json({
                success: false,
                message: 'ebarimtType must be CITIZEN or ENTITY',
            });
            return;
        }

        const { updateEbarimtSettings } = await import('../services/userService');
        const user = await updateEbarimtSettings(userId, ebarimtType, ebarimtRegNo || null);

        res.status(200).json({
            success: true,
            message: 'E-Barimt settings updated successfully',
            data: user,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

