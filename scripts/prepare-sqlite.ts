/**
 * Collapse the seeded database into a single self-contained file so it can be
 * read from a read-only filesystem. `pnpm db:seed` leaves the file in WAL mode,
 * which needs to create `-wal`/`-shm` sidecars on open — impossible inside a
 * Vercel function. Switching the journal back to `delete` and vacuuming drops
 * those sidecars and compacts what ships in the bundle.
 *
 * Run with `pnpm db:snapshot` (part of `pnpm vercel-build`). Idempotent.
 */

import { statSync } from 'node:fs';

import Database from 'better-sqlite3';

const DB_PATH = process.env.SQLITE_PATH ?? './data/music.db';

const db = new Database(DB_PATH, { fileMustExist: true });
const [result] = db.pragma('journal_mode = delete') as { journal_mode: string }[];
db.exec('VACUUM');
db.close();

const { size } = statSync(DB_PATH);
console.info(
  `sqlite snapshot ready: ${DB_PATH} (journal_mode=${result?.journal_mode ?? 'unknown'}, ${size} bytes)`,
);
