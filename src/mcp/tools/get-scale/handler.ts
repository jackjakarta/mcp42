import { getScale, MusicInputError } from '../../../music/index.js';
import { type ScaleOutput } from './schemas.js';

export function getScaleHandler(tonic: string, type: string): ScaleOutput {
  try {
    return getScale(tonic, type);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
