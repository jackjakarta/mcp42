import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema/music.js';

type Schema = typeof schema;
type DrizzleDb = BetterSQLite3Database<Schema>;

const DB_PATH = process.env.SQLITE_PATH ?? './data/music.db';

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: DrizzleDb;
};

function getSqlite(): Database.Database {
  if (globalForDb.sqlite !== undefined) {
    return globalForDb.sqlite;
  }

  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  if (process.env.NODE_ENV === 'development') {
    globalForDb.sqlite = sqlite;
  }

  return sqlite;
}

function getDb(): DrizzleDb {
  if (globalForDb.db !== undefined) {
    return globalForDb.db;
  }

  const instance = drizzle({ client: getSqlite(), schema, casing: 'snake_case' });

  if (process.env.NODE_ENV === 'development') {
    globalForDb.db = instance;
  }

  return instance;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
