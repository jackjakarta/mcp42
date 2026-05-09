import { MusicInputError } from '../../../music/index.js';
import { scaleToMidi } from '../../../music/midi/index.js';
import { type GenerateScaleMidiInput, type GenerateScaleMidiOutput } from './schemas.js';

export function generateScaleMidiHandler(input: GenerateScaleMidiInput): GenerateScaleMidiOutput {
  try {
    return scaleToMidi(input);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
