import { and, arrayContains, asc, eq, ilike, type SQL } from 'drizzle-orm';

import { db } from '../index.js';
import { modesTable, type ModeModel } from '../schema/music.js';

export type ModeSummary = Pick<
  ModeModel,
  'slug' | 'name' | 'parentScale' | 'mood' | 'commonGenres'
>;

export interface SearchModesArgs {
  mood?: string;
  genre?: string;
  parentScale?: string;
}

export async function dbSearchModes({
  mood,
  genre,
  parentScale,
}: SearchModesArgs): Promise<ModeSummary[]> {
  const conditions: SQL[] = [];
  if (mood !== undefined) conditions.push(ilike(modesTable.mood, `%${mood}%`));
  if (genre !== undefined) conditions.push(arrayContains(modesTable.commonGenres, [genre]));
  if (parentScale !== undefined) conditions.push(eq(modesTable.parentScale, parentScale));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      slug: modesTable.slug,
      name: modesTable.name,
      parentScale: modesTable.parentScale,
      mood: modesTable.mood,
      commonGenres: modesTable.commonGenres,
    })
    .from(modesTable)
    .where(where)
    .orderBy(asc(modesTable.slug));

  return rows;
}

export async function dbGetModeBySlug({ slug }: { slug: string }): Promise<ModeModel | undefined> {
  const [mode] = await db.select().from(modesTable).where(eq(modesTable.slug, slug));

  return mode;
}
