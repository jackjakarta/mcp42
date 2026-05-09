import { dbGetModeBySlug } from '../../../db/functions/modes.js';
import { type GetModeInput, type GetModeOutput } from './schemas.js';

export async function getModeHandler({ slug }: GetModeInput): Promise<GetModeOutput> {
  const mode = await dbGetModeBySlug({ slug });
  if (mode === undefined) {
    throw new Error(`Mode not found: ${slug}`);
  }

  return {
    slug: mode.slug,
    name: mode.name,
    parentScale: mode.parentScale,
    intervals: mode.intervals,
    characteristicNotes: mode.characteristicNotes,
    mood: mode.mood,
    commonGenres: mode.commonGenres,
  };
}
