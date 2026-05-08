import { Chord, Interval } from 'tonal';

import { MusicInputError } from './errors.js';

export type ChordInfo = {
  root: string;
  quality: string;
  notes: string[];
  intervals: string[];
  extensions: string[];
  bass?: string;
};

export function parseChordSymbol(symbol: string): ChordInfo {
  const chord = Chord.get(symbol);
  if (chord.empty || chord.tonic === null || chord.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }

  const EXTENSION_DEGREES = new Set([7, 9, 11, 13]);
  const extensions = chord.intervals.filter((iv) => {
    const parsed = Interval.get(iv);
    return !parsed.empty && EXTENSION_DEGREES.has(parsed.num);
  });

  return {
    root: chord.tonic,
    quality: chord.quality,
    notes: chord.notes,
    intervals: [...chord.intervals],
    extensions,
    bass: chord.bass !== '' && chord.bass !== chord.tonic ? chord.bass : undefined,
  };
}
