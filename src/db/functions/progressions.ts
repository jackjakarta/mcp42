import { and, arrayContains, asc, eq, ilike, type SQL } from 'drizzle-orm';

import { db } from '../index.js';
import { progressionsTable, type ProgressionModel } from '../schema/music.js';

export type ProgressionSummary = Pick<
  ProgressionModel,
  'slug' | 'name' | 'romanNumerals' | 'exampleKeys' | 'genres' | 'moods' | 'era'
>;

export interface SearchProgressionsArgs {
  genre?: string;
  mood?: string;
  era?: string;
  romanContains?: string;
  limit?: number;
}

export async function dbSearchProgressions({
  genre,
  mood,
  era,
  romanContains,
  limit = 50,
}: SearchProgressionsArgs): Promise<ProgressionSummary[]> {
  const conditions: SQL[] = [];
  if (genre !== undefined) conditions.push(arrayContains(progressionsTable.genres, [genre]));
  if (mood !== undefined) conditions.push(arrayContains(progressionsTable.moods, [mood]));
  if (era !== undefined) conditions.push(ilike(progressionsTable.era, `%${era}%`));
  if (romanContains !== undefined) {
    conditions.push(arrayContains(progressionsTable.romanNumerals, [romanContains]));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      slug: progressionsTable.slug,
      name: progressionsTable.name,
      romanNumerals: progressionsTable.romanNumerals,
      exampleKeys: progressionsTable.exampleKeys,
      genres: progressionsTable.genres,
      moods: progressionsTable.moods,
      era: progressionsTable.era,
    })
    .from(progressionsTable)
    .where(where)
    .orderBy(asc(progressionsTable.slug))
    .limit(limit);

  return rows;
}

export async function dbGetProgressionBySlug({
  slug,
}: {
  slug: string;
}): Promise<ProgressionModel | undefined> {
  const [progression] = await db
    .select()
    .from(progressionsTable)
    .where(eq(progressionsTable.slug, slug));

  return progression;
}
