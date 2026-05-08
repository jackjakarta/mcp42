import { Note } from 'tonal';

import { MusicInputError } from './errors.js';

export type NoteInfo = {
  name: string;
  pc: string;
  octave: number;
  midi: number;
  freq: number;
  accidentals: string;
};

const HAS_OCTAVE = /-?\d/;

export function getNoteInfo(input: string): NoteInfo {
  const withOctave = HAS_OCTAVE.test(input) ? input : `${input}4`;
  const note = Note.get(withOctave);

  if (note.empty) {
    throw new MusicInputError(`Invalid note: ${input}`);
  }
  if (note.midi === null || note.freq === null || note.oct === undefined) {
    throw new MusicInputError(`Could not resolve octave for note: ${input}`);
  }

  return {
    name: note.name,
    pc: note.pc,
    octave: note.oct,
    midi: note.midi,
    freq: note.freq,
    accidentals: note.acc,
  };
}
