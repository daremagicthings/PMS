import { Request, Response } from 'express';
import { getHealthStatus } from '../services/healthService';

/**
 * Controller for the /health endpoint.
 * Delegates to the health service and returns the response.
 *
 * Constitution Rule: Controllers are ONLY responsible for receiving the request,
 * calling the appropriate Service, and returning the response.
 *
 * @param _req - Express request (unused)
 * @param res - Express response
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
    try {
        const result = getHealthStatus();
        res.status(200).json(result);
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        console.error('[HealthController] Error:', err.message);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};
