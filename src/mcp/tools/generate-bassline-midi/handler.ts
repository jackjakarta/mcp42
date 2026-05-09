import { MusicInputError } from '../../../music/index.js';
import { basslineToMidi } from '../../../music/midi/index.js';
import { type GenerateBasslineMidiInput, type GenerateBasslineMidiOutput } from './schemas.js';

export function generateBasslineMidiHandler(
  input: GenerateBasslineMidiInput,
): GenerateBasslineMidiOutput {
  try {
    return basslineToMidi(input);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
