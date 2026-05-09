import { and, asc, eq, type SQL } from 'drizzle-orm';

import { db } from '../index.js';
import { voicingsTable, type VoicingModel } from '../schema/music.js';

export interface ListVoicingsArgs {
  chordQuality?: string;
  instrument?: string;
}

export async function dbListVoicings({
  chordQuality,
  instrument,
}: ListVoicingsArgs): Promise<VoicingModel[]> {
  const conditions: SQL[] = [];
  if (chordQuality !== undefined) conditions.push(eq(voicingsTable.chordQuality, chordQuality));
  if (instrument !== undefined) conditions.push(eq(voicingsTable.instrument, instrument));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.select().from(voicingsTable).where(where).orderBy(asc(voicingsTable.slug));

  return rows;
}
