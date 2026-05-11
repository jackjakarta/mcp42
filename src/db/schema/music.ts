import { randomUUID } from 'node:crypto';

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { type UpdateDbRow } from '../types';

export const progressionsTable = sqliteTable('music_progressions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  romanNumerals: text('roman_numerals', { mode: 'json' }).$type<string[]>().notNull(),
  exampleKeys: text('example_keys', { mode: 'json' }).$type<string[]>().notNull(),
  genres: text('genres', { mode: 'json' }).$type<string[]>().notNull(),
  era: text('era'),
  moods: text('moods', { mode: 'json' }).$type<string[]>().notNull(),
  attribution: text('attribution'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ProgressionModel = typeof progressionsTable.$inferSelect;
export type InsertProgressionModel = typeof progressionsTable.$inferInsert;
export type UpdateProgressionModel = UpdateDbRow<ProgressionModel>;

export const modesTable = sqliteTable('music_modes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  parentScale: text('parent_scale').notNull(),
  intervals: text('intervals', { mode: 'json' }).$type<string[]>().notNull(),
  characteristicNotes: text('characteristic_notes', { mode: 'json' }).$type<string[]>().notNull(),
  mood: text('mood'),
  commonGenres: text('common_genres', { mode: 'json' }).$type<string[]>().notNull(),
});

export type ModeModel = typeof modesTable.$inferSelect;
export type InsertModeModel = typeof modesTable.$inferInsert;
export type UpdateModeModel = UpdateDbRow<ModeModel>;

export const voicingsTable = sqliteTable('music_voicings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text('slug').notNull().unique(),
  chordQuality: text('chord_quality').notNull(),
  name: text('name').notNull(),
  notesTemplate: text('notes_template', { mode: 'json' }).$type<string[]>().notNull(),
  instrument: text('instrument'),
});

export type VoicingModel = typeof voicingsTable.$inferSelect;
export type InsertVoicingModel = typeof voicingsTable.$inferInsert;
export type UpdateVoicingModel = UpdateDbRow<VoicingModel>;

export const cadencesTable = sqliteTable('music_cadences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  romanPattern: text('roman_pattern', { mode: 'json' }).$type<string[]>().notNull(),
  description: text('description').notNull(),
});

export type CadenceModel = typeof cadencesTable.$inferSelect;
export type InsertCadenceModel = typeof cadencesTable.$inferInsert;
export type UpdateCadenceModel = UpdateDbRow<CadenceModel>;
