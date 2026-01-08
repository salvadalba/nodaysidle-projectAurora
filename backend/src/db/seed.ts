import { query, closePool } from '../db/connection.js';
import { hashPassword } from '../services/auth.service.js';

/**
 * Seed database with demo data
 */
async function seed() {
    console.log('[SEED] Starting database seed...');

    try {
        // Create demo user
        const passwordHash = await hashPassword('demo123');

        const userResult = await query<{ id: string }>(
            `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
            ['demo@aurora.dev', passwordHash, 'Demo User']
        );

        const userId = userResult.rows[0].id;
        console.log(`[SEED] Created/updated demo user: ${userId}`);

        // Create user preferences
        await query(
            `INSERT INTO user_preferences (user_id, max_blur_intensity, performance_mode, theme)
       VALUES ($1, 50, 'auto', 'dark')
       ON CONFLICT (user_id) DO NOTHING`,
            [userId]
        );
        console.log('[SEED] Created user preferences');

        // Create demo dashboard
        const dashboardResult = await query<{ id: string }>(
            `INSERT INTO dashboards (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id`,
            [userId, 'Overview Dashboard', 'Main dashboard with key metrics and analytics']
        );

        const dashboardId = dashboardResult.rows[0].id;
        console.log(`[SEED] Created demo dashboard: ${dashboardId}`);

        // Create layers (Z-axis depth)
        const layers = [
            { z_index: 0, name: 'Surface', opacity: 1.0, blur: 0 },
            { z_index: 1, name: 'Metrics Layer', opacity: 0.95, blur: 5 },
            { z_index: 2, name: 'Charts Layer', opacity: 0.9, blur: 10 },
            { z_index: 3, name: 'Detailed Analytics', opacity: 0.85, blur: 15 },
        ];

        const layerIds: string[] = [];

        for (const layer of layers) {
            const result = await query<{ id: string }>(
                `INSERT INTO layers (dashboard_id, z_index, name, opacity, blur_intensity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
                [dashboardId, layer.z_index, layer.name, layer.opacity, layer.blur]
            );
            layerIds.push(result.rows[0].id);
        }
        console.log(`[SEED] Created ${layers.length} layers`);

        // Create sample widgets
        const widgets = [
            { layer: 0, type: 'metric', title: 'Total Revenue', config: { prefix: '$', suffix: 'K' } },
            { layer: 0, type: 'metric', title: 'Active Users', config: { format: 'number' } },
            { layer: 0, type: 'metric', title: 'Conversion Rate', config: { suffix: '%' } },
            { layer: 1, type: 'chart', title: 'Revenue Trend', config: { chartType: 'line' } },
            { layer: 1, type: 'chart', title: 'User Growth', config: { chartType: 'area' } },
            { layer: 2, type: 'composite', title: 'Marketing Attribution', config: {} },
            { layer: 2, type: 'chart', title: 'Funnel Analysis', config: { chartType: 'funnel' } },
        ];

        for (const widget of widgets) {
            await query(
                `INSERT INTO widgets (layer_id, dashboard_id, type, title, config, data_source)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    layerIds[widget.layer],
                    dashboardId,
                    widget.type,
                    widget.title,
                    JSON.stringify(widget.config),
                    JSON.stringify({ source: 'demo', refreshInterval: 30000 }),
                ]
            );
        }
        console.log(`[SEED] Created ${widgets.length} widgets`);

        console.log('[SEED] ✓ Database seeded successfully!');
        console.log('[SEED] Demo credentials: demo@aurora.dev / demo123');
    } catch (error) {
        console.error('[SEED] Error:', error);
        throw error;
    }
}

seed()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
