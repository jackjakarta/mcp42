import { MusicInputError, transposeProgression, type TransposeBy } from '../../../music/index.js';
import { type TransposeProgressionOutput } from './schemas.js';

export function transposeProgressionHandler(
  chords: string[],
  interval: string | undefined,
  targetKey: string | undefined,
): TransposeProgressionOutput {
  const by: TransposeBy = interval !== undefined ? { interval } : { targetKey: targetKey ?? '' };
  try {
    return transposeProgression(chords, by);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
