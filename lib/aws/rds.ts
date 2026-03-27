/**
 * AWS RDS PostgreSQL connection pool
 *
 * Uses `pg` with SSL for Vercel Functions → RDS connectivity.
 * Connection is lazy-initialized and reused across invocations (Fluid Compute).
 */

import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const config: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };

  if (process.env.DATABASE_SSL === "true") {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);
  return pool;
}

/** Execute a query with parameters */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool();
  const result = await client.query(text, params);
  return result.rows as T[];
}

/** Execute a query returning a single row */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Execute an insert/update/delete returning affected count */
export async function execute(text: string, params?: unknown[]): Promise<number> {
  const client = getPool();
  const result = await client.query(text, params);
  return result.rowCount ?? 0;
}
