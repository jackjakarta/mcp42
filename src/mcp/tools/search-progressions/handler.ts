import { dbSearchProgressions } from '../../../db/functions/progressions.js';
import { type SearchProgressionsInput, type SearchProgressionsOutput } from './schemas.js';

export async function searchProgressionsHandler(
  input: SearchProgressionsInput,
): Promise<SearchProgressionsOutput> {
  const results = await dbSearchProgressions(input);
  return { results };
}
