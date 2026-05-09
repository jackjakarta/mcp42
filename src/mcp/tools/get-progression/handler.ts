import { dbGetProgressionBySlug } from '../../../db/functions/progressions.js';
import { type GetProgressionInput, type GetProgressionOutput } from './schemas.js';

export async function getProgressionHandler({
  slug,
}: GetProgressionInput): Promise<GetProgressionOutput> {
  const progression = await dbGetProgressionBySlug({ slug });
  if (progression === undefined) {
    throw new Error(`Progression not found: ${slug}`);
  }

  return {
    slug: progression.slug,
    name: progression.name,
    description: progression.description,
    romanNumerals: progression.romanNumerals,
    exampleKeys: progression.exampleKeys,
    genres: progression.genres,
    era: progression.era,
    moods: progression.moods,
    attribution: progression.attribution,
  };
}
