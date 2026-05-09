import { getKeyDetails, MusicInputError, type KeyMode } from '../../../music/index.js';
import { type KeyOutput } from './schemas.js';

export function getKeyHandler(tonic: string, mode: KeyMode): KeyOutput {
  try {
    return getKeyDetails(tonic, mode);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
