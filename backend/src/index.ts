import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { testConnection, closePool } from './db/connection.js';

// Extend Express Request to include custom properties
declare global {
    namespace Express {
        interface Request {
            id: string;
            userId?: string;
        }
    }
}

const app: Express = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// Middleware
// =============================================================================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc)
            if (!origin) return callback(null, true);

            // Check if origin matches any allowed pattern
            const isAllowed = allowedOrigins.some((allowed) => {
                if (allowed instanceof RegExp) return allowed.test(origin);
                return allowed === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(null, true); // Allow all in development
            }
        },
        credentials: true,
    })
);

// Parse JSON bodies
app.use(express.json());

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = req.headers['x-request-id'] as string || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
});

// Metrics middleware
import { metricsMiddleware } from './middleware/metrics.middleware.js';
app.use(metricsMiddleware);

// =============================================================================
// Routes
// =============================================================================

import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import widgetRoutes from './routes/widget.routes.js';
import userRoutes from './routes/user.routes.js';

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API root
app.get('/api', (_req: Request, res: Response) => {
    res.json({
        name: 'Aurora API',
        version: '1.0.0',
        description: 'Spatial SaaS Dashboard Backend',
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Dashboard routes
app.use('/api/dashboards', dashboardRoutes);

// Widget routes
app.use('/api/widgets', widgetRoutes);

// User routes
app.use('/api/users', userRoutes);

// Import error handlers
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// =============================================================================
// Server Start
// =============================================================================

async function startServer() {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.warn('[SERVER] Starting without database connection');
    }

    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌌 Aurora API Server                                       ║
║                                                              ║
║   Port: ${PORT}                                                ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Database: ${dbConnected ? '✓ Connected' : '✗ Not connected'}                           ║
║   Time: ${new Date().toISOString()}                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[SERVER] SIGTERM received, shutting down gracefully...');
    await closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[SERVER] SIGINT received, shutting down gracefully...');
    await closePool();
    process.exit(0);
});

startServer().catch(console.error);

export default app;
