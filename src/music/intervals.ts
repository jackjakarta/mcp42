import { Interval } from 'tonal';

import { MusicInputError } from './errors.js';

export type IntervalInfo = {
  name: string;
  semitones: number;
  quality: string;
  number: number;
};

export function getInterval(from: string, to: string): IntervalInfo {
  const name = Interval.distance(from, to);
  if (name === '') {
    throw new MusicInputError(`Cannot compute interval from ${from} to ${to}`);
  }
  const ivl = Interval.get(name);
  if (ivl.empty) {
    throw new MusicInputError(`Invalid interval: ${name}`);
  }

  return {
    name: ivl.name,
    semitones: ivl.semitones,
    quality: ivl.q,
    number: ivl.num,
  };
}
