import { query } from '../db/connection.js';

// Types
interface User {
    id: string;
    email: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
}

interface UserPreferences {
    id: string;
    user_id: string;
    max_blur_intensity: number;
    performance_mode: 'auto' | 'performance' | 'quality';
    theme: 'dark' | 'light';
    default_dashboard_id: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    preferences: {
        maxBlurIntensity: number;
        performanceMode: 'auto' | 'performance' | 'quality';
        theme: 'dark' | 'light';
        defaultDashboardId: string | null;
    };
    createdAt: Date;
}

/**
 * Get user profile with preferences
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    // Get user
    const userResult = await query<User>(
        'SELECT * FROM users WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        return null;
    }

    const user = userResult.rows[0];

    // Get or create preferences
    let preferencesResult = await query<UserPreferences>(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
    );

    // Create default preferences if none exist
    if (preferencesResult.rows.length === 0) {
        await query(
            `INSERT INTO user_preferences (user_id, max_blur_intensity, performance_mode, theme) 
       VALUES ($1, 50, 'auto', 'dark')`,
            [userId]
        );
        preferencesResult = await query<UserPreferences>(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [userId]
        );
    }

    const preferences = preferencesResult.rows[0];

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: {
            maxBlurIntensity: preferences.max_blur_intensity,
            performanceMode: preferences.performance_mode,
            theme: preferences.theme,
            defaultDashboardId: preferences.default_dashboard_id,
        },
        createdAt: user.created_at,
    };
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
    userId: string,
    data: {
        maxBlurIntensity?: number;
        performanceMode?: 'auto' | 'performance' | 'quality';
        theme?: 'dark' | 'light';
        defaultDashboardId?: string | null;
    }
): Promise<UserProfile['preferences']> {
    // Validate values
    if (data.maxBlurIntensity !== undefined) {
        if (data.maxBlurIntensity < 0 || data.maxBlurIntensity > 100) {
            throw new Error('INVALID_BLUR_INTENSITY');
        }
    }

    if (data.performanceMode !== undefined) {
        if (!['auto', 'performance', 'quality'].includes(data.performanceMode)) {
            throw new Error('INVALID_PERFORMANCE_MODE');
        }
    }

    if (data.theme !== undefined) {
        if (!['dark', 'light'].includes(data.theme)) {
            throw new Error('INVALID_THEME');
        }
    }

    // Build update query
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.maxBlurIntensity !== undefined) {
        updates.push(`max_blur_intensity = $${paramIndex++}`);
        values.push(data.maxBlurIntensity);
    }
    if (data.performanceMode !== undefined) {
        updates.push(`performance_mode = $${paramIndex++}`);
        values.push(data.performanceMode);
    }
    if (data.theme !== undefined) {
        updates.push(`theme = $${paramIndex++}`);
        values.push(data.theme);
    }
    if (data.defaultDashboardId !== undefined) {
        updates.push(`default_dashboard_id = $${paramIndex++}`);
        values.push(data.defaultDashboardId);
    }

    if (updates.length === 0) {
        // No updates, return current preferences
        const profile = await getUserProfile(userId);
        return profile!.preferences;
    }

    // Ensure preferences row exists
    const existingResult = await query(
        'SELECT id FROM user_preferences WHERE user_id = $1',
        [userId]
    );

    if (existingResult.rows.length === 0) {
        await query(
            `INSERT INTO user_preferences (user_id, max_blur_intensity, performance_mode, theme) 
       VALUES ($1, 50, 'auto', 'dark')`,
            [userId]
        );
    }

    // Apply updates
    values.push(userId);
    const result = await query<UserPreferences>(
        `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values
    );

    const prefs = result.rows[0];

    return {
        maxBlurIntensity: prefs.max_blur_intensity,
        performanceMode: prefs.performance_mode,
        theme: prefs.theme,
        defaultDashboardId: prefs.default_dashboard_id,
    };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: { name?: string }
): Promise<User> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }

    if (updates.length === 0) {
        const result = await query<User>('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    }

    values.push(userId);
    const result = await query<User>(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
    );

    return result.rows[0];
}
