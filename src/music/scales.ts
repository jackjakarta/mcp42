import { Note, Scale } from 'tonal';

import { MusicInputError } from './errors.js';

export type ScaleInfo = {
  notes: string[];
  intervals: string[];
  chords: string[];
  modeOf?: string;
};

const DIATONIC_PARENT_OFFSET: Record<string, string> = {
  ionian: '1P',
  major: '1P',
  dorian: '-2M',
  phrygian: '-3M',
  lydian: '-4P',
  mixolydian: '-5P',
  aeolian: '-6M',
  minor: '-6M',
  locrian: '-7M',
};

export function getScale(tonic: string, type: string): ScaleInfo {
  const scale = Scale.get(`${tonic} ${type}`);
  if (scale.empty) {
    throw new MusicInputError(`Invalid scale: ${tonic} ${type}`);
  }

  const offset = DIATONIC_PARENT_OFFSET[type.toLowerCase()];
  let modeOf: string | undefined;
  if (offset !== undefined && offset !== '1P') {
    const parentTonic = Note.transpose(tonic, offset);
    if (parentTonic !== '') {
      modeOf = `${parentTonic} major`;
    }
  }

  return {
    notes: [...scale.notes],
    intervals: [...scale.intervals],
    chords: Scale.scaleChords(scale.type),
    modeOf,
  };
}
