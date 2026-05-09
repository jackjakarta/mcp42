import { getInterval, MusicInputError } from '../../../music/index.js';
import { type IntervalOutput } from './schemas.js';

export function getIntervalHandler(from: string, to: string): IntervalOutput {
  try {
    return getInterval(from, to);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
