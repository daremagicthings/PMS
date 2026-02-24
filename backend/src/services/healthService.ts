import { ApiResponse } from '../types';

/**
 * Returns a health-check payload confirming the API is running.
 * @returns Standardized success response with server status
 */
export const getHealthStatus = (): ApiResponse<{ uptime: number }> => {
    return {
        success: true,
        message: 'SOH System API is running',
        data: {
            uptime: process.uptime(),
        },
    };
};
