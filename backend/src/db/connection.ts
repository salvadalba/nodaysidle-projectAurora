import pg from 'pg';

const { Pool } = pg;

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 300000, // 5 minutes idle timeout
    connectionTimeoutMillis: 10000, // 10 seconds connection timeout
});

// Log pool errors
pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
});

// Test connection on startup
export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('[DB] Database connected successfully at:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('[DB] Failed to connect to database:', error);
        return false;
    }
}

// Query helper with error handling
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[]
): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        if (duration > 100) {
            console.warn(`[DB] Slow query (${duration}ms):`, text.substring(0, 100));
        }
        return result;
    } catch (error) {
        console.error('[DB] Query error:', { text: text.substring(0, 100), error });
        throw error;
    }
}

// Get a client for transactions
export async function getClient(): Promise<pg.PoolClient> {
    return pool.connect();
}

// Graceful shutdown
export async function closePool(): Promise<void> {
    console.log('[DB] Closing database pool...');
    await pool.end();
    console.log('[DB] Database pool closed');
}

export default pool;
