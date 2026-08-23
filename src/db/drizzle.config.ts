import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { defineConfig } from 'drizzle-kit';

const DB_PATH = process.env.SQLITE_PATH ?? './data/music.db';

// `data/` is gitignored, so on a fresh clone — and on every Vercel build — the
// directory doesn't exist yet and better-sqlite3 refuses to create the file
// without it ("Cannot open database because the directory does not exist").
mkdirSync(dirname(DB_PATH), { recursive: true });

export default defineConfig({
  schema: './src/db/schema/music.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: DB_PATH,
  },
  dialect: 'sqlite',
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
