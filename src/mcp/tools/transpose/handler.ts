import {
  MusicInputError,
  transposeSubject,
  type TransposeBy,
  type TransposeInput,
} from '../../../music/index.js';
import { type TransposeToolOutput } from './schemas.js';

export function transposeToolHandler(
  subject: TransposeInput,
  interval: string | undefined,
  targetKey: string | undefined,
): TransposeToolOutput {
  const by: TransposeBy = interval !== undefined ? { interval } : { targetKey: targetKey ?? '' };
  try {
    return transposeSubject(subject, by);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
