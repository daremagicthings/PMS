/**
 * Shared type definitions for the SOH System backend.
 * All API responses follow a standardized format as mandated by Constitution.md.
 */

/** Standardized API success response */
export interface ApiResponse<T = unknown> {
    success: true;
    message: string;
    data?: T;
}

/** Standardized API error response */
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}
