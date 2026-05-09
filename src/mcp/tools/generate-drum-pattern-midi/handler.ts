import { MusicInputError } from '../../../music/index.js';
import { drumPatternToMidi } from '../../../music/midi/index.js';
import {
  type GenerateDrumPatternMidiInput,
  type GenerateDrumPatternMidiOutput,
} from './schemas.js';

export function generateDrumPatternMidiHandler(
  input: GenerateDrumPatternMidiInput,
): GenerateDrumPatternMidiOutput {
  try {
    return drumPatternToMidi(input);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
