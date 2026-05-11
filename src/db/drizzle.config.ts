import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/music.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: './data/music.db',
  },
  dialect: 'sqlite',
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
