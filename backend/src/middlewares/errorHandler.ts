import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types';

/**
 * Global error-handling middleware.
 * Catches any unhandled errors thrown in routes/controllers/services
 * and returns a standardized JSON error response.
 *
 * Constitution Rule: "NEVER crash the server" — always return a user-friendly response.
 *
 * @param err - The error object thrown
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param _next - Express next function (unused but required for Express error middleware signature)
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('[ERROR]', err.message);
    console.error(err.stack);

    const response: ApiErrorResponse = {
        success: false,
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };

    res.status(500).json(response);
};
