import { Chord, Key, Note } from 'tonal';

import { parseChordSymbol } from './chords.js';
import { MusicInputError } from './errors.js';
import { keyDiatonicTriads, pcOf } from './pitchClass.js';
import { chordToRoman, type RomanKey } from './romanAnalysis.js';

export type SubstitutionResult = {
  tritoneSub?: { symbol: string; roman: string };
  secondaryDominant?: { symbol: string; roman: string };
  borrowedChords: {
    symbol: string;
    roman: string;
    sourceMode: 'parallel-minor' | 'parallel-major';
  }[];
  modalInterchange: {
    symbol: string;
    roman: string;
    sourceMode: 'dorian' | 'mixolydian' | 'phrygian';
  }[];
};

const SCALE_PCS_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const SCALE_PCS_MINOR = [0, 2, 3, 5, 7, 8, 10];
const NATURAL_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const;
const NATURAL_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const;

const MODE_PARENT_OFFSET: Record<'dorian' | 'mixolydian' | 'phrygian', string> = {
  dorian: '-2M',
  mixolydian: '-5P',
  phrygian: '-3M',
};
const MODE_START_INDEX: Record<'dorian' | 'mixolydian' | 'phrygian', number> = {
  dorian: 1,
  mixolydian: 4,
  phrygian: 2,
};

function diatonicChordSet(key: RomanKey): Set<string> {
  return new Set(keyDiatonicTriads(key.tonic, key.mode));
}

function modeTriads(
  modeName: 'dorian' | 'mixolydian' | 'phrygian',
  tonic: string,
): readonly string[] {
  const parent = Note.transpose(tonic, MODE_PARENT_OFFSET[modeName]);
  if (parent === '') {
    throw new MusicInputError(`Could not derive ${modeName} parent for ${tonic}`);
  }
  const parentTriads = Key.majorKey(parent).triads;
  if (parentTriads.length === 0) return [];
  const start = MODE_START_INDEX[modeName];
  return [...parentTriads.slice(start), ...parentTriads.slice(0, start)];
}

function stripSeventh(roman: string): string {
  return roman
    .replace(/maj7$/i, '')
    .replace(/ø7$/, '°')
    .replace(/7$/, '')
    .replace(/9$/, '')
    .replace(/11$/, '')
    .replace(/13$/, '');
}

export function suggestSubstitutions(chord: string, key: RomanKey): SubstitutionResult {
  const ci = parseChordSymbol(chord);
  const ownLabel = chordToRoman(chord, key);
  const ownRoman = stripSeventh(ownLabel.roman.split('/')[0] ?? ownLabel.roman);

  const result: SubstitutionResult = { borrowedChords: [], modalInterchange: [] };

  const tonicPc = pcOf(key.tonic);
  const rootPc = pcOf(ci.root);
  const isTonic = rootPc === tonicPc;

  const tonalChord = Chord.get(chord);
  const intervals = new Set<string>(tonalChord.intervals);
  const isDominant7 =
    intervals.has('3M') && intervals.has('5P') && intervals.has('7m') && !intervals.has('7M');

  if (isDominant7) {
    const subRoot = Note.transpose(ci.root, 'd5');
    if (subRoot !== '') {
      const subSymbol = `${subRoot}7`;
      // Target is the chord's resolution: a P5 down from chord root.
      const resolutionPc = (rootPc + 5) % 12;
      const offsetFromTonic = (resolutionPc - tonicPc + 12) % 12;
      const scalePcs = key.mode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
      const idx = scalePcs.indexOf(offsetFromTonic);
      let targetRoman: string;
      if (idx >= 0) {
        targetRoman =
          key.mode === 'major' ? (NATURAL_MAJOR[idx] ?? 'I') : (NATURAL_MINOR[idx] ?? 'i');
      } else {
        targetRoman = key.mode === 'major' ? 'I' : 'i';
      }
      result.tritoneSub = { symbol: subSymbol, roman: `subV/${targetRoman}` };
    }
  }

  // 2) Secondary dominant of `chord` — skip when chord is the tonic.
  if (!isTonic) {
    const domRoot = Note.transpose(ci.root, 'P5');
    if (domRoot !== '') {
      const domSymbol = `${domRoot}7`;
      result.secondaryDominant = { symbol: domSymbol, roman: `V7/${ownRoman}` };
    }
  }

  // 3) Borrowed chords from parallel mode.
  const parallelMode: 'major' | 'minor' = key.mode === 'major' ? 'minor' : 'major';
  const parallelTriads = keyDiatonicTriads(key.tonic, parallelMode);
  const ownDiatonic = diatonicChordSet(key);
  for (const t of parallelTriads) {
    if (ownDiatonic.has(t)) continue;
    const label = chordToRoman(t, key);
    result.borrowedChords.push({
      symbol: t,
      roman: label.roman,
      sourceMode: parallelMode === 'minor' ? 'parallel-minor' : 'parallel-major',
    });
  }

  // 4) Modal interchange from parallel Dorian / Mixolydian / Phrygian.
  const seen = new Set<string>([...ownDiatonic, ...result.borrowedChords.map((b) => b.symbol)]);
  for (const modeName of ['dorian', 'mixolydian', 'phrygian'] as const) {
    const triads = modeTriads(modeName, key.tonic);
    for (const t of triads) {
      if (seen.has(t)) continue;
      seen.add(t);
      const label = chordToRoman(t, key);
      result.modalInterchange.push({ symbol: t, roman: label.roman, sourceMode: modeName });
    }
  }

  return result;
}
