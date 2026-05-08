import { Key } from 'tonal';

import { MusicInputError } from './errors.js';

export type KeyMode = 'major' | 'minor';

export type DiatonicChord = {
  degree: number;
  roman: string;
  symbol: string;
};

export type KeyInfo = {
  signature: string;
  scale: string[];
  diatonicChords: DiatonicChord[];
  primary: string[];
  secondaryDominants: string[];
};

const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

function buildDiatonicChords(
  triads: readonly string[],
  romans: readonly string[],
): DiatonicChord[] {
  return triads.map((symbol, i) => ({
    degree: i + 1,
    roman: romans[i] ?? '',
    symbol,
  }));
}

function pickPrimary(triads: readonly string[]): string[] {
  return [triads[0] ?? '', triads[3] ?? '', triads[4] ?? ''];
}

export function getKeyDetails(tonic: string, mode: KeyMode): KeyInfo {
  if (mode === 'major') {
    const k = Key.majorKey(tonic);
    if (k.scale.length === 0) {
      throw new MusicInputError(`Invalid key: ${tonic} major`);
    }
    return {
      signature: k.keySignature,
      scale: [...k.scale],
      diatonicChords: buildDiatonicChords(k.triads, ROMAN_MAJOR),
      primary: pickPrimary(k.triads),
      secondaryDominants: k.secondaryDominants.filter((s) => s !== ''),
    };
  }

  const k = Key.minorKey(tonic);
  if (k.natural.scale.length === 0) {
    throw new MusicInputError(`Invalid key: ${tonic} minor`);
  }
  return {
    signature: k.keySignature,
    scale: [...k.natural.scale],
    diatonicChords: buildDiatonicChords(k.natural.triads, ROMAN_MINOR),
    primary: pickPrimary(k.natural.triads),
    secondaryDominants: k.natural.secondaryDominants.filter((s) => s !== ''),
  };
}
