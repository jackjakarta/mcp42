import { MusicInputError, parseChordSymbol } from '../../../music/index.js';
import { type ChordOutput } from './schemas.js';

export function getChordHandler(symbol: string): ChordOutput {
  try {
    return parseChordSymbol(symbol);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
