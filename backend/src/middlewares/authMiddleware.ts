import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { tenantContext } from '../lib/tenantContext';

/** JWT secret — must match authService.ts */
const JWT_SECRET = process.env.JWT_SECRET || 'soh-dev-secret-key';

/** Shape of the decoded JWT payload */
interface JwtPayload {
    userId: string;
    role: Role;
    organizationId?: string | null;
}

/**
 * Extend the Express Request type to include authenticated user data.
 * This allows `req.user` to be available in downstream controllers.
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Authentication middleware that verifies the JWT token from the
 * Authorization header and attaches user data to the request.
 *
 * Usage: Apply to protected routes that require a logged-in user.
 * Constitution: Follows "Do No Harm" — never crashes, returns clear errors.
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId,
        };

        // Wrap the rest of the request in the tenant context
        tenantContext.run({
            userId: decoded.userId,
            role: decoded.role,
            organizationId: decoded.organizationId || null,
        }, () => {
            next();
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');

        if (err.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.',
            });
            return;
        }

        if (err.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Authentication failed.',
        });
    }
};
