import { pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { type UpdateDbRow } from '../types';

export const appSchema = pgSchema('app');

export const exampleTable = appSchema.table('example', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ExampleModel = typeof exampleTable.$inferSelect;
export type InsertExampleModel = typeof exampleTable.$inferInsert;
export type UpdateExampleModel = UpdateDbRow<ExampleModel>;
