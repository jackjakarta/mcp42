import { MusicInputError, parseKeyString, suggestSubstitutions } from '../../../music/index.js';
import { type SuggestSubstitutionsOutput } from './schemas.js';

export function suggestSubstitutionsHandler(
  chord: string,
  key: string,
): SuggestSubstitutionsOutput {
  try {
    const parsedKey = parseKeyString(key);
    return suggestSubstitutions(chord, parsedKey);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
