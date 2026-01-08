import { Request, Response, NextFunction } from 'express';
import { logRequest, logResponse } from '../utils/logger.js';

/**
 * Middleware to track request duration and log responses
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Log request start
    logRequest(req.method, req.path, req.id, req.userId);

    // Override res.end to capture response timing
    const originalEnd = res.end.bind(res);

    res.end = function (chunk?: unknown, encoding?: BufferEncoding | (() => void), callback?: () => void): Response {
        const duration = Date.now() - startTime;

        // Log response
        logResponse(req.method, req.path, res.statusCode, duration, req.id, req.userId);

        // Add timing header (only if headers not sent)
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', `${duration}ms`);
        }

        // Emit metric for monitoring (placeholder for actual metrics system)
        if (duration > 1000) {
            console.warn(`[SLOW REQUEST] ${req.method} ${req.path} took ${duration}ms`);
        }

        // Call original end with proper type handling
        if (typeof encoding === 'function') {
            return originalEnd(chunk, encoding);
        }
        return originalEnd(chunk, encoding as BufferEncoding, callback);
    } as typeof res.end;

    next();
}
