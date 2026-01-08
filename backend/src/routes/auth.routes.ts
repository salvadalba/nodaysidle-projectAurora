import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// POST /api/auth/login - Rate limited to 5 requests per minute
router.post('/login', authRateLimiter, login);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
