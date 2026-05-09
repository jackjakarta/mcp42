import { detectKey, MusicInputError } from '../../../music/index.js';
import { type DetectKeyOutput } from './schemas.js';

export function detectKeyHandler(
  chords: string[] | undefined,
  notes: string[] | undefined,
): DetectKeyOutput {
  try {
    const candidates = detectKey({ chords, notes });
    return { candidates };
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
