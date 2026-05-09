import { analyzeProgression, MusicInputError } from '../../../music/index.js';
import { type AnalyzeProgressionOutput } from './schemas.js';

export function analyzeProgressionHandler(
  chords: string[],
  keyHint: string | undefined,
): AnalyzeProgressionOutput {
  try {
    return analyzeProgression(chords, keyHint);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
