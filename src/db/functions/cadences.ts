import { asc } from 'drizzle-orm';

import { db } from '../index.js';
import { cadencesTable, type CadenceModel } from '../schema/music.js';

export async function dbListCadences(): Promise<CadenceModel[]> {
  const rows = await db.select().from(cadencesTable).orderBy(asc(cadencesTable.slug));

  return rows;
}
