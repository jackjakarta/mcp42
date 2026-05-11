import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema/music.js';

const DB_PATH = process.env.SQLITE_PATH ?? './data/music.db';

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

function getSqlite(): Database.Database {
  if (globalForDb.sqlite !== undefined) {
    return globalForDb.sqlite;
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  if (process.env.NODE_ENV === 'development') {
    globalForDb.sqlite = sqlite;
  }

  return sqlite;
}

export const db = drizzle({ client: getSqlite(), schema, casing: 'snake_case' });
