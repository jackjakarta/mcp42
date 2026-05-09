import {
  chordQualityKey,
  getKeyDetails,
  MusicInputError,
  parseKeyString,
} from '../../../music/index.js';
import { type DiatonicChordsOutput } from './schemas.js';

export function getDiatonicChordsHandler(key: string): DiatonicChordsOutput {
  try {
    const parsed = parseKeyString(key);
    const info = getKeyDetails(parsed.tonic, parsed.mode);
    return {
      chords: info.diatonicChords.map((c) => ({
        degree: c.degree,
        roman: c.roman,
        symbol: c.symbol,
        quality: chordQualityKey(c.symbol),
      })),
    };
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
