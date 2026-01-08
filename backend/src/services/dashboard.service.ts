import { query } from '../db/connection.js';

// Types
interface Dashboard {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
}

interface Layer {
    id: string;
    dashboard_id: string;
    z_index: number;
    name: string;
    opacity: number;
    blur_intensity: number;
    created_at: Date;
    updated_at: Date;
}

interface Widget {
    id: string;
    layer_id: string;
    dashboard_id: string;
    type: 'metric' | 'chart' | 'composite';
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

export interface DashboardWithLayers extends Dashboard {
    layers: (Layer & { widgets: Widget[] })[];
}

/**
 * Get dashboard by ID with optional layers and widgets
 */
export async function getDashboard(
    dashboardId: string,
    userId: string,
    options: { includeWidgets?: boolean; layerDepth?: number } = {}
): Promise<DashboardWithLayers | null> {
    // First, get the dashboard and verify ownership
    const dashboardResult = await query<Dashboard>(
        'SELECT * FROM dashboards WHERE id = $1',
        [dashboardId]
    );

    if (dashboardResult.rows.length === 0) {
        return null;
    }

    const dashboard = dashboardResult.rows[0];

    // Check ownership
    if (dashboard.user_id !== userId) {
        throw new Error('FORBIDDEN');
    }

    // Get layers ordered by z_index
    let layersQuery = `
    SELECT * FROM layers 
    WHERE dashboard_id = $1 
    ORDER BY z_index ASC
  `;
    const layersParams: unknown[] = [dashboardId];

    if (options.layerDepth && options.layerDepth > 0) {
        layersQuery = `
      SELECT * FROM layers 
      WHERE dashboard_id = $1 
      ORDER BY z_index ASC 
      LIMIT $2
    `;
        layersParams.push(options.layerDepth);
    }

    const layersResult = await query<Layer>(layersQuery, layersParams);
    const layers = layersResult.rows;

    // Get widgets if requested
    const layersWithWidgets = await Promise.all(
        layers.map(async (layer) => {
            if (options.includeWidgets) {
                const widgetsResult = await query<Widget>(
                    'SELECT * FROM widgets WHERE layer_id = $1 ORDER BY z_index ASC',
                    [layer.id]
                );
                return { ...layer, widgets: widgetsResult.rows };
            }
            return { ...layer, widgets: [] };
        })
    );

    return {
        ...dashboard,
        layers: layersWithWidgets,
    };
}

/**
 * Get all dashboards for a user
 */
export async function getUserDashboards(userId: string): Promise<Dashboard[]> {
    const result = await query<Dashboard>(
        'SELECT * FROM dashboards WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
    );
    return result.rows;
}

/**
 * Get layers for a dashboard
 */
export async function getDashboardLayers(
    dashboardId: string,
    userId: string
): Promise<Layer[]> {
    // First verify dashboard ownership
    const dashboardResult = await query<Dashboard>(
        'SELECT user_id FROM dashboards WHERE id = $1',
        [dashboardId]
    );

    if (dashboardResult.rows.length === 0) {
        throw new Error('NOT_FOUND');
    }

    if (dashboardResult.rows[0].user_id !== userId) {
        throw new Error('FORBIDDEN');
    }

    const result = await query<Layer>(
        `SELECT l.*, 
      (SELECT COUNT(*) FROM widgets WHERE layer_id = l.id) as widget_count
     FROM layers l 
     WHERE l.dashboard_id = $1 
     ORDER BY l.z_index ASC`,
        [dashboardId]
    );

    return result.rows;
}

/**
 * Create a new dashboard
 */
export async function createDashboard(
    userId: string,
    name: string,
    description?: string
): Promise<Dashboard> {
    const result = await query<Dashboard>(
        `INSERT INTO dashboards (user_id, name, description) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
        [userId, name, description || null]
    );

    // Create default surface layer
    await query(
        `INSERT INTO layers (dashboard_id, z_index, name, opacity, blur_intensity) 
     VALUES ($1, 0, 'Surface', 1.0, 0)`,
        [result.rows[0].id]
    );

    return result.rows[0];
}

/**
 * Create a new layer
 */
export async function createLayer(
    dashboardId: string,
    userId: string,
    data: { name: string; opacity?: number; blurIntensity?: number }
): Promise<Layer> {
    // Verify dashboard ownership
    const dashboardResult = await query<Dashboard>(
        'SELECT user_id FROM dashboards WHERE id = $1',
        [dashboardId]
    );

    if (dashboardResult.rows.length === 0) {
        throw new Error('NOT_FOUND');
    }

    if (dashboardResult.rows[0].user_id !== userId) {
        throw new Error('FORBIDDEN');
    }

    // Get next z_index
    const maxZResult = await query<{ max: number }>(
        'SELECT COALESCE(MAX(z_index), -1) as max FROM layers WHERE dashboard_id = $1',
        [dashboardId]
    );
    const nextZIndex = (maxZResult.rows[0]?.max ?? -1) + 1;

    if (nextZIndex > 100) {
        throw new Error('MAX_LAYERS_REACHED');
    }

    const result = await query<Layer>(
        `INSERT INTO layers (dashboard_id, z_index, name, opacity, blur_intensity) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
        [
            dashboardId,
            nextZIndex,
            data.name,
            data.opacity ?? 0.8,
            data.blurIntensity ?? 10,
        ]
    );

    return result.rows[0];
}
