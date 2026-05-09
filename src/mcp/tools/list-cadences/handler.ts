import { dbListCadences } from '../../../db/functions/cadences.js';
import { type ListCadencesOutput } from './schemas.js';

export async function listCadencesHandler(): Promise<ListCadencesOutput> {
  const cadences = await dbListCadences();
  return {
    results: cadences.map((c) => ({
      slug: c.slug,
      name: c.name,
      romanPattern: c.romanPattern,
      description: c.description,
    })),
  };
}
