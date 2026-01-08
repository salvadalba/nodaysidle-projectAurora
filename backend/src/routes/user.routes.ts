import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    updatePreferences,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user profile
router.get('/me', getProfile);

// PATCH /api/users/me - Update user profile
router.patch('/me', updateProfile);

// PATCH /api/users/me/preferences - Update preferences
router.patch('/me/preferences', updatePreferences);

export default router;
