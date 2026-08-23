import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema/music.js';

type Schema = typeof schema;
type DrizzleDb = BetterSQLite3Database<Schema>;

const DB_PATH = process.env.SQLITE_PATH ?? './data/music.db';

// Serverless filesystems are read-only outside /tmp, so WAL mode can't create
// the `-wal`/`-shm` sidecars it needs next to the file. The knowledge graph is
// never written at runtime, so open the snapshot built by `pnpm db:snapshot`
// read-only instead. VERCEL is set by the platform; SQLITE_READONLY is the
// escape hatch for any other read-only host.
const READ_ONLY = process.env.SQLITE_READONLY === '1' || process.env.VERCEL === '1';

// Memoized on globalThis so `tsx watch` reloads reuse the open handle rather
// than opening a second one per module instance.
const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: DrizzleDb;
};

function getSqlite(): Database.Database {
  if (globalForDb.sqlite !== undefined) {
    return globalForDb.sqlite;
  }

  if (READ_ONLY) {
    const sqlite = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    sqlite.pragma('foreign_keys = ON');
    globalForDb.sqlite = sqlite;

    return sqlite;
  }

  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  globalForDb.sqlite = sqlite;

  return sqlite;
}

function getDb(): DrizzleDb {
  if (globalForDb.db !== undefined) {
    return globalForDb.db;
  }

  const instance = drizzle({ client: getSqlite(), schema, casing: 'snake_case' });
  globalForDb.db = instance;

  return instance;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
