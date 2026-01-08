import { Request, Response, NextFunction } from 'express';
import {
    createWidget,
    updateWidget,
    updateWidgetDocking,
    deleteWidget,
    getWidgetData,
    getWidgetById,
    WidgetType,
} from '../services/widget.service.js';

/**
 * POST /api/widgets
 * Create a new widget
 */
export async function createWidgetHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { layerId, type, title, config, dataSource } = req.body;

        // Validate required fields
        if (!layerId) {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'Layer ID is required' },
            });
        }

        if (!type || !['metric', 'chart', 'composite'].includes(type)) {
            return res.status(400).json({
                error: { code: 'INVALID_TYPE', message: 'Widget type must be metric, chart, or composite' },
            });
        }

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'Widget title is required' },
            });
        }

        const widget = await createWidget(userId, {
            layerId,
            type: type as WidgetType,
            title: title.trim(),
            config,
            dataSource,
        });

        res.status(201).json(widget);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Layer not found' },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: { code: 'FORBIDDEN', message: 'You do not have access to this layer' },
                });
            }
        }
        next(error);
    }
}

/**
 * PATCH /api/widgets/:id
 * Update a widget
 */
export async function updateWidgetHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { title, config, dataSource } = req.body;

        const widget = await updateWidget(id, userId, { title, config, dataSource });

        res.json(widget);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Widget not found' },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: { code: 'FORBIDDEN', message: 'You do not have access to this widget' },
                });
            }
        }
        next(error);
    }
}

/**
 * PATCH /api/widgets/:id/docking
 * Update widget docking state
 */
export async function updateDockingHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { isDocked, targetLayerId, position } = req.body;

        if (typeof isDocked !== 'boolean') {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'isDocked must be a boolean' },
            });
        }

        if (isDocked && !targetLayerId) {
            return res.status(400).json({
                error: { code: 'INVALID_INPUT', message: 'targetLayerId is required when docking' },
            });
        }

        const widget = await updateWidgetDocking(id, userId, { isDocked, targetLayerId, position });

        res.json(widget);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Widget not found' },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: { code: 'FORBIDDEN', message: 'You do not have access to this widget' },
                });
            }
            if (error.message === 'MAX_DOCKED_REACHED') {
                return res.status(400).json({
                    error: { code: 'MAX_DOCKED_REACHED', message: 'Maximum of 10 docked widgets per layer' },
                });
            }
        }
        next(error);
    }
}

/**
 * DELETE /api/widgets/:id
 * Delete a widget
 */
export async function deleteWidgetHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        await deleteWidget(id, userId);

        res.json({ id, deleted: true });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'NOT_FOUND') {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Widget not found' },
                });
            }
            if (error.message === 'FORBIDDEN') {
                return res.status(403).json({
                    error: { code: 'FORBIDDEN', message: 'You do not have access to this widget' },
                });
            }
        }
        next(error);
    }
}

/**
 * GET /api/widgets/:id/data
 * Get widget data with time range
 */
export async function getWidgetDataHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const timeRange = req.query.timeRange as '7d' | '30d' | '90d' | undefined;
        const includeConstituents = req.query.includeConstituents === 'true';

        // Validate time range
        if (timeRange && !['7d', '30d', '90d'].includes(timeRange)) {
            return res.status(400).json({
                error: { code: 'INVALID_TIME_RANGE', message: 'timeRange must be 7d, 30d, or 90d' },
            });
        }

        const data = await getWidgetData(id, userId, { timeRange, includeConstituents });

        if (!data) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Widget not found' },
            });
        }

        res.json(data);
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not have access to this widget' },
            });
        }
        next(error);
    }
}

/**
 * GET /api/widgets/:id
 * Get a single widget
 */
export async function getWidgetHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        const widget = await getWidgetById(id, userId);

        if (!widget) {
            return res.status(404).json({
                error: { code: 'NOT_FOUND', message: 'Widget not found' },
            });
        }

        res.json(widget);
    } catch (error) {
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not have access to this widget' },
            });
        }
        next(error);
    }
}
