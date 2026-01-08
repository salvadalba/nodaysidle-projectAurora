import { Request, Response, NextFunction } from 'express';
import {
    getDashboard,
    getUserDashboards,
    getDashboardLayers,
    createDashboard,
    createLayer,
} from '../services/dashboard.service.js';

/**
 * GET /api/dashboards
 * Get all dashboards for the authenticated user
 */
export async function listDashboards(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const dashboards = await getUserDashboards(userId);

        res.json({ dashboards });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/dashboards/:id
 * Get a single dashboard with layers and optionally widgets
 */
export async function getDashboardById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const includeWidgets = req.query.includeWidgets === 'true';
        const layerDepth = req.query.layerDepth ? parseInt(req.query.layerDepth as string, 10) : undefined;

        const dashboard = await getDashboard(id, userId, { includeWidgets, layerDepth });

        if (!dashboard) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Dashboard not found',
                },
            });
        }

        res.json(dashboard);
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have access to this dashboard',
                },
            });
        }
        next(error);
    }
}

/**
 * GET /api/dashboards/:id/layers
 * Get all layers for a dashboard
 */
export async function getLayers(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        const layers = await getDashboardLayers(id, userId);

        res.json({ layers });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Dashboard not found',
                    },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You do not have access to this dashboard',
                    },
                });
            }
        }
        next(error);
    }
}

/**
 * POST /api/dashboards
 * Create a new dashboard
 */
export async function createDashboardHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Dashboard name is required',
                },
            });
        }

        const dashboard = await createDashboard(userId, name.trim(), description);

        res.status(201).json(dashboard);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/dashboards/:id/layers
 * Create a new layer in a dashboard
 */
export async function createLayerHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { name, opacity, blurIntensity } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Layer name is required',
                },
            });
        }

        const layer = await createLayer(id, userId, {
            name: name.trim(),
            opacity,
            blurIntensity,
        });

        res.status(201).json(layer);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Dashboard not found',
                    },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You do not have access to this dashboard',
                    },
                });
            }
            if (error.message === 'MAX_LAYERS_REACHED') {
                return res.status(400).json({
                    error: {
                        code: 'MAX_LAYERS_REACHED',
                        message: 'Maximum of 100 layers per dashboard',
                    },
                });
            }
        }
        next(error);
    }
}
