import { pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { type UpdateDbRow } from '../types';

export const musicSchema = pgSchema('music');

export const progressionsTable = musicSchema.table('progressions', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  romanNumerals: text('roman_numerals').array().notNull(),
  exampleKeys: text('example_keys').array().notNull(),
  genres: text('genres').array().notNull(),
  era: text('era'),
  moods: text('moods').array().notNull(),
  attribution: text('attribution'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ProgressionModel = typeof progressionsTable.$inferSelect;
export type InsertProgressionModel = typeof progressionsTable.$inferInsert;
export type UpdateProgressionModel = UpdateDbRow<ProgressionModel>;

export const modesTable = musicSchema.table('modes', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  parentScale: text('parent_scale').notNull(),
  intervals: text('intervals').array().notNull(),
  characteristicNotes: text('characteristic_notes').array().notNull(),
  mood: text('mood'),
  commonGenres: text('common_genres').array().notNull(),
});

export type ModeModel = typeof modesTable.$inferSelect;
export type InsertModeModel = typeof modesTable.$inferInsert;
export type UpdateModeModel = UpdateDbRow<ModeModel>;

export const voicingsTable = musicSchema.table('voicings', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  chordQuality: text('chord_quality').notNull(),
  name: text('name').notNull(),
  notesTemplate: text('notes_template').array().notNull(),
  instrument: text('instrument'),
});

export type VoicingModel = typeof voicingsTable.$inferSelect;
export type InsertVoicingModel = typeof voicingsTable.$inferInsert;
export type UpdateVoicingModel = UpdateDbRow<VoicingModel>;

export const cadencesTable = musicSchema.table('cadences', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  romanPattern: text('roman_pattern').array().notNull(),
  description: text('description').notNull(),
});

export type CadenceModel = typeof cadencesTable.$inferSelect;
export type InsertCadenceModel = typeof cadencesTable.$inferInsert;
export type UpdateCadenceModel = UpdateDbRow<CadenceModel>;
