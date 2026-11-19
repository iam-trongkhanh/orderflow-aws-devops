import pg from 'pg';
import type { Config } from './config.js';
export function createPool(c: Config) {
  return new pg.Pool({ connectionString:c.databaseUrl, max:c.poolMax, connectionTimeoutMillis:c.connectTimeout,
    idleTimeoutMillis:30000, query_timeout:c.queryTimeout, statement_timeout:c.queryTimeout,
    application_name:'orderflow' });
}
