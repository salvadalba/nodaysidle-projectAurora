import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../services/auth.service.js';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_CREDENTIALS',
                    message: 'Email and password are required',
                },
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Please provide a valid email address',
                },
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_PASSWORD',
                    message: 'Password must be at least 6 characters',
                },
            });
        }

        // Authenticate user
        const result = await authenticateUser(email, password);

        if (!result) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                },
            });
        }

        // Return token and user
        res.json({
            token: result.token,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/logout
 * Logout user (client should discard token)
 */
export async function logout(_req: Request, res: Response) {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint exists for API completeness
    res.json({
        message: 'Logged out successfully',
    });
}
