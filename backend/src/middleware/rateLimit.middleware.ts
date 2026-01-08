import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Rate limiter middleware factory
 * @param config - Rate limit configuration
 * @returns Express middleware
 */
export function rateLimit(config: RateLimitConfig) {
    const { windowMs, maxRequests } = config;

    return (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        const key = `${clientIp}:${req.path}`;
        const now = Date.now();

        let entry = rateLimitStore.get(key);

        // Create new entry if none exists or window has expired
        if (!entry || entry.resetTime < now) {
            entry = {
                count: 1,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, entry);
        } else {
            entry.count++;
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

        // Check if limit exceeded
        if (entry.count > maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);

            return res.status(429).json({
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests. Please try again later.',
                    details: {
                        retryAfter,
                    },
                },
            });
        }

        next();
    };
}

// Pre-configured rate limiter for auth endpoints (5 requests per minute)
export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
});
