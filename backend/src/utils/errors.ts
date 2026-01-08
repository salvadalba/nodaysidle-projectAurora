/**
 * Custom application error class
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;

    constructor(
        code: string,
        message: string,
        statusCode: number = 500,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Common error factory functions
 */
export const Errors = {
    badRequest: (message: string, details?: Record<string, unknown>) =>
        new AppError('BAD_REQUEST', message, 400, details),

    unauthorized: (message: string = 'Authentication required') =>
        new AppError('UNAUTHORIZED', message, 401),

    forbidden: (message: string = 'Access denied') =>
        new AppError('FORBIDDEN', message, 403),

    notFound: (resource: string = 'Resource') =>
        new AppError('NOT_FOUND', `${resource} not found`, 404),

    conflict: (message: string) =>
        new AppError('CONFLICT', message, 409),

    tooManyRequests: (retryAfter: number) =>
        new AppError('TOO_MANY_REQUESTS', 'Rate limit exceeded', 429, { retryAfter }),

    internal: (message: string = 'An unexpected error occurred') =>
        new AppError('INTERNAL_ERROR', message, 500),
};

/**
 * Error response envelope type
 */
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    requestId?: string;
}

/**
 * Create error response envelope
 */
export function createErrorResponse(
    error: AppError | Error,
    requestId?: string
): ErrorResponse {
    if (error instanceof AppError) {
        return {
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            requestId,
        };
    }

    // Generic error - hide details in production
    return {
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error.message,
        },
        requestId,
    };
}
