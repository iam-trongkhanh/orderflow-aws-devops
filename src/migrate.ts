import { readdir, readFile } from 'node:fs/promises';
import { config } from './config.js';
import { createPool } from './db.js';
export async function migrate() {
  const pool = createPool(config());
  pool.on('error', () => {});
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(73190421)');
      await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
      const directory = new URL('../migrations/', import.meta.url);
      for (const name of (await readdir(directory)).filter(n => /^\d+.*\.sql$/.test(n)).sort()) {
        if ((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name])).rowCount) continue;
        await client.query(await readFile(new URL(name,directory),'utf8'));
        await client.query('INSERT INTO schema_migrations(name) VALUES ($1)',[name]);
      }
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } finally { await pool.end(); }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().then(() => console.log('Migrations applied')).catch(() => { console.error('Migration failed; verify database connectivity and migration SQL'); process.exitCode=1; });
}
