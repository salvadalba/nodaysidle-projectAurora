import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    const reqIdStr = requestId ? `[${requestId}]` : '';
    const userStr = userId ? `[User:${userId}]` : '';
    return `${timestamp} ${level}: ${reqIdStr}${userStr} ${message} ${metaStr}`;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        json()
    ),
    defaultMeta: { service: 'aurora-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? combine(timestamp(), json())
                : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
        }),
    ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
    }));
}

/**
 * Create a child logger with request context
 */
export function createRequestLogger(requestId: string, userId?: string) {
    return logger.child({ requestId, userId });
}

/**
 * Log API request start
 */
export function logRequest(
    method: string,
    path: string,
    requestId: string,
    userId?: string
) {
    logger.info('API Request', {
        method,
        path,
        requestId,
        userId,
    });
}

/**
 * Log API response
 */
export function logResponse(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    requestId: string,
    userId?: string
) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, 'API Response', {
        method,
        path,
        statusCode,
        durationMs,
        requestId,
        userId,
    });
}

/**
 * Log error
 */
export function logError(
    error: Error,
    requestId?: string,
    userId?: string,
    context?: Record<string, unknown>
) {
    logger.error(error.message, {
        name: error.name,
        stack: error.stack,
        requestId,
        userId,
        ...context,
    });
}

export default logger;
