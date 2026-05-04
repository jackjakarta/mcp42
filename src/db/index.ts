import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const globalPool = global as unknown as {
  pool?: Pool;
};

const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error('Database URL undefined');
}

const pool =
  globalPool.pool ??
  new Pool({
    connectionString,
    max: 12,
  });

// in development mode, store the pool globally to reuse it across hot reloads
if (process.env.NODE_ENV === 'development') {
  globalPool.pool = pool;
}

export const db = drizzle({ client: pool, casing: 'snake_case' });
