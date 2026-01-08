import { Request, Response, NextFunction } from 'express';
import {
    getUserProfile,
    updateUserPreferences,
    updateUserProfile,
} from '../services/user.service.js';

/**
 * GET /api/users/me
 * Get current user profile with preferences
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;

        const profile = await getUserProfile(userId);

        if (!profile) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'User not found' },
            });
        }

        res.json(profile);
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/users/me
 * Update current user profile
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { name } = req.body;

        const user = await updateUserProfile(userId, { name });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/users/me/preferences
 * Update user preferences
 */
export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { maxBlurIntensity, performanceMode, theme, defaultDashboardId } = req.body;

        const preferences = await updateUserPreferences(userId, {
            maxBlurIntensity,
            performanceMode,
            theme,
            defaultDashboardId,
        });

        res.json({
            id: userId,
            preferences,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'INVALID_BLUR_INTENSITY') {
                return res.status(400).json({
                    error: { code: 'INVALID_INPUT', message: 'maxBlurIntensity must be between 0 and 100' },
                });
            }
            if (error.message === 'INVALID_PERFORMANCE_MODE') {
                return res.status(400).json({
                    error: { code: 'INVALID_INPUT', message: 'performanceMode must be auto, performance, or quality' },
                });
            }
            if (error.message === 'INVALID_THEME') {
                return res.status(400).json({
                    error: { code: 'INVALID_INPUT', message: 'theme must be dark or light' },
                });
            }
        }
        next(error);
    }
}
