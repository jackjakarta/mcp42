import { Chord, Interval, Note } from 'tonal';

import { MusicInputError } from './errors.js';

export type TransposeBy = { interval: string } | { targetKey: string };

export type TransposeInput = string | string[];

export type TransposeResult =
  | { kind: 'note'; value: string; interval: string }
  | { kind: 'chord'; value: string; interval: string }
  | { kind: 'chords'; value: string[]; interval: string };

const SCIENTIFIC_PITCH = /^[A-Ga-g][b#x]*-?\d/;

function resolveCurrentTonic(subject: TransposeInput): string {
  if (Array.isArray(subject)) {
    const first = subject[0];
    if (first === undefined) {
      throw new MusicInputError('Cannot transpose an empty chord array');
    }
    const chord = Chord.get(first);
    if (chord.empty || chord.tonic === null || chord.tonic === '') {
      throw new MusicInputError(`Invalid chord symbol: ${first}`);
    }
    return chord.tonic;
  }
  if (SCIENTIFIC_PITCH.test(subject)) {
    const note = Note.get(subject);
    if (note.empty) {
      throw new MusicInputError(`Invalid note: ${subject}`);
    }
    return note.pc;
  }
  const chord = Chord.get(subject);
  if (chord.empty || chord.tonic === null || chord.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${subject}`);
  }
  return chord.tonic;
}

function resolveInterval(subject: TransposeInput, by: TransposeBy): string {
  if ('interval' in by) {
    const ivl = Interval.get(by.interval);
    if (ivl.empty) {
      throw new MusicInputError(`Invalid interval: ${by.interval}`);
    }
    return by.interval;
  }
  const currentTonic = resolveCurrentTonic(subject);
  const ivl = Interval.distance(currentTonic, by.targetKey);
  if (ivl === '') {
    throw new MusicInputError(`Invalid target key: ${by.targetKey}`);
  }
  return ivl;
}

export function transposeSubject(subject: TransposeInput, by: TransposeBy): TransposeResult {
  const interval = resolveInterval(subject, by);

  if (Array.isArray(subject)) {
    const value = subject.map((c) => {
      const t = Chord.transpose(c, interval);
      if (t === '') {
        throw new MusicInputError(`Could not transpose chord ${c} by ${interval}`);
      }
      return t;
    });
    return { kind: 'chords', value, interval };
  }

  if (SCIENTIFIC_PITCH.test(subject)) {
    const value = Note.transpose(subject, interval);
    if (value === '') {
      throw new MusicInputError(`Could not transpose note ${subject} by ${interval}`);
    }
    return { kind: 'note', value, interval };
  }

  const value = Chord.transpose(subject, interval);
  if (value === '') {
    throw new MusicInputError(`Could not transpose chord ${subject} by ${interval}`);
  }
  return { kind: 'chord', value, interval };
}
