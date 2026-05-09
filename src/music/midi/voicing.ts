import { Chord, Note } from 'tonal';

import { MusicInputError } from '../errors.js';

export type ArpeggioPattern = 'up' | 'down' | 'alternating' | 'random';

export function chordToPitches(symbol: string, baseOctave: number): string[] {
  const chord = Chord.get(symbol);
  if (chord.empty || chord.tonic === null || chord.tonic === '' || chord.notes.length === 0) {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }

  const out: string[] = [];
  let prevMidi = Number.NEGATIVE_INFINITY;
  for (const pc of chord.notes) {
    let octave = baseOctave;
    let placed = false;
    while (octave <= 9) {
      const candidate = `${pc}${octave}`;
      const m = Note.midi(candidate);
      if (m === null || m === undefined) {
        throw new MusicInputError(`Invalid chord tone: ${candidate}`);
      }
      if (m > prevMidi) {
        out.push(candidate);
        prevMidi = m;
        placed = true;
        break;
      }
      octave++;
    }
    if (!placed) {
      throw new MusicInputError(
        `Chord ${symbol} cannot be voiced ascending from octave ${baseOctave}`,
      );
    }
  }
  return out;
}

export function arpeggiate(
  pitches: string[],
  pattern: ArpeggioPattern,
  count: number,
  rng?: () => number,
): string[] {
  const fallback = pitches[0];
  if (fallback === undefined) {
    throw new MusicInputError('arpeggiate requires at least one pitch');
  }
  if (count <= 0) return [];

  const pick = (i: number): string => pitches[i] ?? fallback;
  const seq: string[] = [];

  switch (pattern) {
    case 'up':
      for (let i = 0; i < count; i++) seq.push(pick(i % pitches.length));
      return seq;

    case 'down':
      for (let i = 0; i < count; i++) {
        const idx = pitches.length - 1 - (i % pitches.length);
        seq.push(pick(idx));
      }
      return seq;

    case 'alternating': {
      const cycle = pitches.length === 1 ? 1 : 2 * (pitches.length - 1);
      for (let i = 0; i < count; i++) {
        const k = i % cycle;
        const idx = k < pitches.length ? k : cycle - k;
        seq.push(pick(idx));
      }
      return seq;
    }

    case 'random': {
      if (!rng) throw new MusicInputError('random pattern requires a seeded rng');
      for (let i = 0; i < count; i++) {
        seq.push(pick(Math.floor(rng() * pitches.length)));
      }
      return seq;
    }
  }
}
