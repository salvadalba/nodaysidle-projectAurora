import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection, closePool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationRecord {
    id: number;
    name: string;
    applied_at: Date;
}

// Ensure migrations table exists
async function ensureMigrationsTable(): Promise<void> {
    await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

// Get list of applied migrations
async function getAppliedMigrations(): Promise<string[]> {
    const result = await query<MigrationRecord>('SELECT name FROM migrations ORDER BY id');
    return result.rows.map(row => row.name);
}

// Apply a single migration
async function applyMigration(name: string, sql: string): Promise<void> {
    console.log(`[MIGRATE] Applying: ${name}`);

    try {
        await query('BEGIN');
        await query(sql);
        await query('INSERT INTO migrations (name) VALUES ($1)', [name]);
        await query('COMMIT');
        console.log(`[MIGRATE] ✓ Applied: ${name}`);
    } catch (error) {
        await query('ROLLBACK');
        console.error(`[MIGRATE] ✗ Failed: ${name}`, error);
        throw error;
    }
}

// Run all pending migrations
async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
    const migrationsDir = join(__dirname, '../../migrations');

    console.log('[MIGRATE] Starting migration...');
    console.log(`[MIGRATE] Migrations directory: ${migrationsDir}`);

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
        throw new Error('Cannot connect to database');
    }

    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get applied migrations
    const applied = await getAppliedMigrations();
    console.log(`[MIGRATE] Already applied: ${applied.length} migrations`);

    // Get migration files
    const files = await readdir(migrationsDir);
    const migrationFiles = files
        .filter(f => f.endsWith(`.${direction}.sql`))
        .sort();

    console.log(`[MIGRATE] Found ${migrationFiles.length} ${direction} migration files`);

    // Apply pending migrations
    let appliedCount = 0;
    for (const file of migrationFiles) {
        const baseName = file.replace(`.${direction}.sql`, '');

        if (direction === 'up' && applied.includes(baseName)) {
            console.log(`[MIGRATE] Skipping (already applied): ${baseName}`);
            continue;
        }

        if (direction === 'down' && !applied.includes(baseName)) {
            console.log(`[MIGRATE] Skipping (not applied): ${baseName}`);
            continue;
        }

        const filePath = join(migrationsDir, file);
        const sql = await readFile(filePath, 'utf-8');

        await applyMigration(baseName, sql);
        appliedCount++;
    }

    console.log(`[MIGRATE] Complete! Applied ${appliedCount} migrations.`);
}

// Main execution
const direction = process.argv[2] === 'down' ? 'down' : 'up';

runMigrations(direction)
    .then(() => {
        console.log('[MIGRATE] Migration finished successfully');
        return closePool();
    })
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('[MIGRATE] Migration failed:', error);
        closePool().finally(() => process.exit(1));
    });
