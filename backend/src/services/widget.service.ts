import { query } from '../db/connection.js';

// Types
export type WidgetType = 'metric' | 'chart' | 'composite';

interface Widget {
    id: string;
    layer_id: string;
    dashboard_id: string;
    type: WidgetType;
    title: string;
    config: Record<string, unknown>;
    data_source: Record<string, unknown>;
    is_docked: boolean;
    docked_layer_id: string | null;
    docked_position: { x: number; y: number };
    z_index: number;
    created_at: Date;
    updated_at: Date;
}

interface WidgetData {
    id: string;
    widget_id: string;
    timestamp: Date;
    value: number;
    trend: number;
    constituents: Array<{ name: string; value: number; weight: number }>;
    historical: Array<{ timestamp: string; value: number }>;
}

interface Layer {
    id: string;
    dashboard_id: string;
}

/**
 * Verify user owns the widget's dashboard
 */
async function verifyWidgetOwnership(widgetId: string, userId: string): Promise<Widget | null> {
    const result = await query<Widget & { user_id: string }>(
        `SELECT w.*, d.user_id 
     FROM widgets w 
     JOIN dashboards d ON w.dashboard_id = d.id 
     WHERE w.id = $1`,
        [widgetId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    if (result.rows[0].user_id !== userId) {
        throw new Error('FORBIDDEN');
    }

    return result.rows[0];
}

/**
 * Verify user owns the layer's dashboard
 */
async function verifyLayerOwnership(layerId: string, userId: string): Promise<Layer & { user_id: string }> {
    const result = await query<Layer & { user_id: string }>(
        `SELECT l.*, d.user_id 
     FROM layers l 
     JOIN dashboards d ON l.dashboard_id = d.id 
     WHERE l.id = $1`,
        [layerId]
    );

    if (result.rows.length === 0) {
        throw new Error('NOT_FOUND');
    }

    if (result.rows[0].user_id !== userId) {
        throw new Error('FORBIDDEN');
    }

    return result.rows[0];
}

/**
 * Create a new widget
 */
export async function createWidget(
    userId: string,
    data: {
        layerId: string;
        type: WidgetType;
        title: string;
        config?: Record<string, unknown>;
        dataSource?: Record<string, unknown>;
    }
): Promise<Widget> {
    // Verify layer ownership
    const layer = await verifyLayerOwnership(data.layerId, userId);

    // Validate widget type
    const validTypes: WidgetType[] = ['metric', 'chart', 'composite'];
    if (!validTypes.includes(data.type)) {
        throw new Error('INVALID_TYPE');
    }

    // Get next z_index for the layer
    const maxZResult = await query<{ max: number }>(
        'SELECT COALESCE(MAX(z_index), -1) as max FROM widgets WHERE layer_id = $1',
        [data.layerId]
    );
    const nextZIndex = (maxZResult.rows[0]?.max ?? -1) + 1;

    const result = await query<Widget>(
        `INSERT INTO widgets (layer_id, dashboard_id, type, title, config, data_source, z_index) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
        [
            data.layerId,
            layer.dashboard_id,
            data.type,
            data.title,
            JSON.stringify(data.config || {}),
            JSON.stringify(data.dataSource || {}),
            nextZIndex,
        ]
    );

    return result.rows[0];
}

/**
 * Update a widget
 */
export async function updateWidget(
    widgetId: string,
    userId: string,
    data: {
        title?: string;
        config?: Record<string, unknown>;
        dataSource?: Record<string, unknown>;
    }
): Promise<Widget> {
    // Verify ownership
    const widget = await verifyWidgetOwnership(widgetId, userId);
    if (!widget) {
        throw new Error('NOT_FOUND');
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
    }
    if (data.config !== undefined) {
        updates.push(`config = $${paramIndex++}`);
        values.push(JSON.stringify(data.config));
    }
    if (data.dataSource !== undefined) {
        updates.push(`data_source = $${paramIndex++}`);
        values.push(JSON.stringify(data.dataSource));
    }

    if (updates.length === 0) {
        return widget;
    }

    values.push(widgetId);
    const result = await query<Widget>(
        `UPDATE widgets SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
    );

    return result.rows[0];
}

/**
 * Update widget docking state
 */
export async function updateWidgetDocking(
    widgetId: string,
    userId: string,
    data: {
        isDocked: boolean;
        targetLayerId?: string;
        position?: { x: number; y: number };
    }
): Promise<Widget> {
    // Verify ownership
    const widget = await verifyWidgetOwnership(widgetId, userId);
    if (!widget) {
        throw new Error('NOT_FOUND');
    }

    // If docking, verify target layer and check docked count
    if (data.isDocked && data.targetLayerId) {
        await verifyLayerOwnership(data.targetLayerId, userId);

        // Check max docked widgets (10)
        const dockedCount = await query<{ count: string }>(
            'SELECT COUNT(*) as count FROM widgets WHERE docked_layer_id = $1 AND is_docked = true',
            [data.targetLayerId]
        );

        if (parseInt(dockedCount.rows[0].count, 10) >= 10) {
            throw new Error('MAX_DOCKED_REACHED');
        }
    }

    const result = await query<Widget>(
        `UPDATE widgets 
     SET is_docked = $1, 
         docked_layer_id = $2, 
         docked_position = $3 
     WHERE id = $4 
     RETURNING *`,
        [
            data.isDocked,
            data.isDocked ? data.targetLayerId : null,
            JSON.stringify(data.position || { x: 0, y: 0 }),
            widgetId,
        ]
    );

    return result.rows[0];
}

/**
 * Delete a widget
 */
export async function deleteWidget(widgetId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const widget = await verifyWidgetOwnership(widgetId, userId);
    if (!widget) {
        throw new Error('NOT_FOUND');
    }

    await query('DELETE FROM widgets WHERE id = $1', [widgetId]);
    return true;
}

/**
 * Get widget data with time range filter
 */
export async function getWidgetData(
    widgetId: string,
    userId: string,
    options: { timeRange?: '7d' | '30d' | '90d'; includeConstituents?: boolean } = {}
): Promise<WidgetData | null> {
    // Verify ownership
    const widget = await verifyWidgetOwnership(widgetId, userId);
    if (!widget) {
        return null;
    }

    // Calculate date range
    const days = options.timeRange === '90d' ? 90 : options.timeRange === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get latest widget data
    const result = await query<WidgetData>(
        `SELECT * FROM widget_data 
     WHERE widget_id = $1 AND timestamp >= $2 
     ORDER BY timestamp DESC 
     LIMIT 1`,
        [widgetId, startDate.toISOString()]
    );

    if (result.rows.length === 0) {
        // Return mock data if no data exists
        return {
            id: widgetId,
            widget_id: widgetId,
            timestamp: new Date(),
            value: Math.random() * 1000,
            trend: (Math.random() - 0.5) * 20,
            constituents: widget.type === 'composite' ? [
                { name: 'Component A', value: Math.random() * 400, weight: 0.4 },
                { name: 'Component B', value: Math.random() * 350, weight: 0.35 },
                { name: 'Component C', value: Math.random() * 250, weight: 0.25 },
            ] : [],
            historical: Array.from({ length: days }, (_, i) => ({
                timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                value: Math.random() * 1000,
            })),
        };
    }

    return result.rows[0];
}

/**
 * Get widget by ID
 */
export async function getWidgetById(widgetId: string, userId: string): Promise<Widget | null> {
    return verifyWidgetOwnership(widgetId, userId);
}
