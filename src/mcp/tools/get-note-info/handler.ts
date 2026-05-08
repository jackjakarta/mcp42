import { getNoteInfo, MusicInputError } from '../../../music/index.js';
import { type NoteInfoOutput } from './schemas.js';

export function getNoteInfoHandler(note: string): NoteInfoOutput {
  try {
    return getNoteInfo(note);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
