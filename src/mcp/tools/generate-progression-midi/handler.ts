import { MusicInputError } from '../../../music/index.js';
import { progressionToMidi } from '../../../music/midi/index.js';
import {
  type GenerateProgressionMidiInput,
  type GenerateProgressionMidiOutput,
} from './schemas.js';

export function generateProgressionMidiHandler(
  input: GenerateProgressionMidiInput,
): GenerateProgressionMidiOutput {
  try {
    return progressionToMidi(input);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
