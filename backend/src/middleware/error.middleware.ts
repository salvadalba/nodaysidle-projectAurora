import { Request, Response, NextFunction } from 'express';
import { AppError, createErrorResponse } from '../utils/errors.js';
import { logError } from '../utils/logger.js';

/**
 * Global error handling middleware
 * Must be registered after all routes
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    // Log the error
    logError(err, req.id, req.userId);

    // Handle known AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(createErrorResponse(err, req.id));
    }

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        const appError = new AppError('INVALID_TOKEN', 'Invalid token', 401);
        return res.status(401).json(createErrorResponse(appError, req.id));
    }

    if (err.name === 'TokenExpiredError') {
        const appError = new AppError('TOKEN_EXPIRED', 'Token has expired', 401);
        return res.status(401).json(createErrorResponse(appError, req.id));
    }

    if (err.name === 'ValidationError') {
        const appError = new AppError('VALIDATION_ERROR', err.message, 400);
        return res.status(400).json(createErrorResponse(appError, req.id));
    }

    // Database errors
    if ((err as NodeJS.ErrnoException).code === '23505') {
        const appError = new AppError('DUPLICATE_ENTRY', 'Resource already exists', 409);
        return res.status(409).json(createErrorResponse(appError, req.id));
    }

    if ((err as NodeJS.ErrnoException).code === '23503') {
        const appError = new AppError('FOREIGN_KEY_VIOLATION', 'Referenced resource not found', 400);
        return res.status(400).json(createErrorResponse(appError, req.id));
    }

    // Generic 500 error - hide details in production
    res.status(500).json(createErrorResponse(err, req.id));
}

/**
 * 404 Not Found handler
 * Must be registered after all routes but before error handler
 */
export function notFoundHandler(req: Request, res: Response) {
    const response = createErrorResponse(
        new AppError('NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404),
        req.id
    );
    res.status(404).json(response);
}
