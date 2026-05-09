import { dbSearchModes } from '../../../db/functions/modes.js';
import { type SearchModesInput, type SearchModesOutput } from './schemas.js';

export async function searchModesHandler(input: SearchModesInput): Promise<SearchModesOutput> {
  const results = await dbSearchModes(input);
  return { results };
}
