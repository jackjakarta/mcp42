import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./src/db/schema/app.ts', './src/db/schema/music.ts'],
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql',
  verbose: true,
  strict: true,
});
