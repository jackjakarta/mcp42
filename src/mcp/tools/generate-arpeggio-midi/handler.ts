import { MusicInputError } from '../../../music/index.js';
import { arpeggioToMidi } from '../../../music/midi/index.js';
import { type GenerateArpeggioMidiInput, type GenerateArpeggioMidiOutput } from './schemas.js';

export function generateArpeggioMidiHandler(
  input: GenerateArpeggioMidiInput,
): GenerateArpeggioMidiOutput {
  try {
    return arpeggioToMidi(input);
  } catch (err) {
    if (err instanceof MusicInputError) {
      throw new Error(err.message);
    }
    throw err;
  }
}
