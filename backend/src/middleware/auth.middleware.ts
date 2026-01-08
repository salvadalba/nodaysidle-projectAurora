import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../services/auth.service.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user ID to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: {
                    code: 'MISSING_TOKEN',
                    message: 'Authorization token is required',
                },
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN_FORMAT',
                    message: 'Token must be in Bearer format',
                },
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        let payload: TokenPayload;
        try {
            payload = verifyToken(token);
        } catch {
            return res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token',
                },
            });
        }

        // Attach user ID to request
        req.userId = payload.userId;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Optional authentication middleware
 * Attaches user ID if token is present, but doesn't require it
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = verifyToken(token);
                req.userId = payload.userId;
            } catch {
                // Token invalid, but that's OK for optional auth
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}
