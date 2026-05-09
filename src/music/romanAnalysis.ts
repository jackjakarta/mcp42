import { Chord } from 'tonal';

import { parseChordSymbol } from './chords.js';
import { MusicInputError } from './errors.js';
import { chordQualityKey, pcOf, type QualityKey } from './pitchClass.js';

export type RomanFunction =
  | 'tonic'
  | 'subdominant'
  | 'dominant'
  | 'predominant'
  | 'chromatic'
  | 'unknown';

export type RomanLabel = {
  index: number;
  chord: string;
  roman: string;
  function: RomanFunction;
  isDiatonic: boolean;
  isBorrowed: boolean;
  isSecondaryDominant: boolean;
  isTritoneSub: boolean;
  appliedTo?: string;
};

export type RomanKey = { tonic: string; mode: 'major' | 'minor' };

const SCALE_PCS_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const SCALE_PCS_MINOR = [0, 2, 3, 5, 7, 8, 10];

const NATURAL_ROMANS_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const;
const NATURAL_ROMANS_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const;

const SEVENTH_ROMANS_MAJOR = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'] as const;
const SEVENTH_ROMANS_MINOR = ['i7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'] as const;

const TRIAD_QUALITIES_MAJOR: QualityKey[] = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const TRIAD_QUALITIES_MINOR: QualityKey[] = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];

const SEVENTH_QUALITIES_MAJOR: QualityKey[] = [
  'maj7',
  'min7',
  'min7',
  'maj7',
  'dom7',
  'min7',
  'm7b5',
];
const SEVENTH_QUALITIES_MINOR: QualityKey[] = [
  'min7',
  'm7b5',
  'maj7',
  'min7',
  'min7',
  'maj7',
  'dom7',
];

const DIATONIC_FUNCTION_MAJOR: RomanFunction[] = [
  'tonic',
  'predominant',
  'tonic',
  'subdominant',
  'dominant',
  'tonic',
  'dominant',
];
const DIATONIC_FUNCTION_MINOR: RomanFunction[] = [
  'tonic',
  'predominant',
  'tonic',
  'subdominant',
  'dominant',
  'subdominant',
  'dominant',
];

// Major-tonic-relative chromatic roman base names, indexed by PC offset 0..11.
const CHROMATIC_BASE: readonly string[] = [
  'I',
  'bII',
  'II',
  'bIII',
  'III',
  'IV',
  '#IV',
  'V',
  'bVI',
  'VI',
  'bVII',
  'VII',
];

function emptyLabel(index: number, chord: string, roman: string, fn: RomanFunction): RomanLabel {
  return {
    index,
    chord,
    roman,
    function: fn,
    isDiatonic: false,
    isBorrowed: false,
    isSecondaryDominant: false,
    isTritoneSub: false,
  };
}

function isMinorishQuality(q: QualityKey): boolean {
  return q === 'min' || q === 'min7' || q === 'dim' || q === 'm7b5';
}

function chromaticRomanFor(offset: number, quality: QualityKey): string {
  const base = CHROMATIC_BASE[offset] ?? '?';
  let roman = base;
  if (isMinorishQuality(quality)) {
    if (roman.startsWith('b') || roman.startsWith('#')) {
      roman = roman[0] + roman.slice(1).toLowerCase();
    } else {
      roman = roman.toLowerCase();
    }
  }
  if (quality === 'dim') roman += '°';
  else if (quality === 'm7b5') roman += 'ø7';
  else if (quality === 'maj7') roman += 'maj7';
  else if (quality === 'dom7') roman += '7';
  else if (quality === 'min7') roman += '7';
  return roman;
}

function bassSlashSuffix(bass: string | undefined, key: RomanKey): string {
  if (bass === undefined) return '';
  const bassPc = pcOf(bass);
  const tonicPc = pcOf(key.tonic);
  const offset = (bassPc - tonicPc + 12) % 12;
  // Always use uppercase chromatic base for bass position.
  const base = CHROMATIC_BASE[offset] ?? '?';
  return `/${base}`;
}

function parallelBorrowedRoman(
  offset: number,
  quality: QualityKey,
  fromMode: 'major' | 'minor',
): string | null {
  // Borrowed if the chord matches the parallel mode's diatonic chord at this offset.
  const scalePcs = fromMode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
  const idx = scalePcs.indexOf(offset);
  if (idx < 0) return null;
  const expectedTriad =
    fromMode === 'major' ? TRIAD_QUALITIES_MAJOR[idx] : TRIAD_QUALITIES_MINOR[idx];
  const expectedSeventh =
    fromMode === 'major' ? SEVENTH_QUALITIES_MAJOR[idx] : SEVENTH_QUALITIES_MINOR[idx];
  if (quality === expectedTriad || quality === expectedSeventh) {
    return chromaticRomanFor(offset, quality);
  }
  return null;
}

function chordTargetOffset(rootPc: number, key: RomanKey): number {
  // P5 down from the chord root = (rootPc + 5) % 12 from tonic.
  const tonicPc = pcOf(key.tonic);
  return (rootPc + 5 - tonicPc + 12) % 12;
}

function targetRomanForOffset(offset: number, mode: 'major' | 'minor'): string | null {
  const scalePcs = mode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
  const idx = scalePcs.indexOf(offset);
  if (idx < 0) return null;
  const r = mode === 'major' ? NATURAL_ROMANS_MAJOR[idx] : NATURAL_ROMANS_MINOR[idx];
  return r ?? null;
}

function chordRootSymbol(symbol: string): string {
  const c = Chord.get(symbol);
  if (c.empty || c.tonic === null || c.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }
  return c.tonic;
}

export function chordToRoman(chord: string, key: RomanKey, index = 0, next?: string): RomanLabel {
  const ci = parseChordSymbol(chord);
  const tonicPc = pcOf(key.tonic);
  const rootPc = pcOf(ci.root);
  const offset = (rootPc - tonicPc + 12) % 12;
  const quality = chordQualityKey(chord);
  const slash = bassSlashSuffix(ci.bass, key);
  const scalePcs = key.mode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
  const idx = scalePcs.indexOf(offset);

  // 1) Diatonic match (triad or 7th)
  if (idx >= 0) {
    const triadQ = key.mode === 'major' ? TRIAD_QUALITIES_MAJOR[idx] : TRIAD_QUALITIES_MINOR[idx];
    const seventhQ =
      key.mode === 'major' ? SEVENTH_QUALITIES_MAJOR[idx] : SEVENTH_QUALITIES_MINOR[idx];
    const fn = key.mode === 'major' ? DIATONIC_FUNCTION_MAJOR[idx] : DIATONIC_FUNCTION_MINOR[idx];

    if (quality === seventhQ) {
      const r = key.mode === 'major' ? SEVENTH_ROMANS_MAJOR[idx] : SEVENTH_ROMANS_MINOR[idx];
      return {
        ...emptyLabel(index, chord, (r ?? '?') + slash, fn ?? 'unknown'),
        isDiatonic: true,
      };
    }
    if (quality === triadQ) {
      const r = key.mode === 'major' ? NATURAL_ROMANS_MAJOR[idx] : NATURAL_ROMANS_MINOR[idx];
      return {
        ...emptyLabel(index, chord, (r ?? '?') + slash, fn ?? 'unknown'),
        isDiatonic: true,
      };
    }
    // Blues color: dom7 on degree I or IV in major key.
    if (key.mode === 'major' && quality === 'dom7' && (idx === 0 || idx === 3)) {
      const r = idx === 0 ? 'I7' : 'IV7';
      return {
        ...emptyLabel(index, chord, r + slash, fn ?? 'unknown'),
        isDiatonic: true,
      };
    }
  }

  // 2) Borrowed from parallel mode
  const parallelMode: 'major' | 'minor' = key.mode === 'major' ? 'minor' : 'major';
  const borrowed = parallelBorrowedRoman(offset, quality, parallelMode);
  if (borrowed !== null) {
    const fn: RomanFunction =
      key.mode === 'major' && parallelMode === 'minor' && (offset === 5 || offset === 8)
        ? 'subdominant'
        : 'tonic';
    return {
      ...emptyLabel(index, chord, borrowed + slash, fn),
      isBorrowed: true,
    };
  }

  // 3) Secondary dominant (dom-quality, root resolves P5 down to a diatonic non-tonic chord)
  if (quality === 'dom7' || quality === 'maj') {
    const targetOffset = chordTargetOffset(rootPc, key);
    if (targetOffset !== 0) {
      const targetRoman = targetRomanForOffset(targetOffset, key.mode);
      if (targetRoman !== null) {
        // Strict: only label as secondary dominant if next chord in progression matches the target,
        // OR if no next is provided (single chord context) AND the target is a diatonic non-tonic.
        let isSecV = false;
        if (next !== undefined) {
          try {
            const nextRoot = chordRootSymbol(next);
            const nextOffset = (pcOf(nextRoot) - pcOf(key.tonic) + 12) % 12;
            if (nextOffset === targetOffset) isSecV = true;
          } catch {
            // ignore parse failure of next chord
          }
        } else {
          isSecV = true;
        }
        if (isSecV) {
          const headRoman = quality === 'dom7' ? 'V7' : 'V';
          return {
            ...emptyLabel(index, chord, `${headRoman}/${targetRoman}${slash}`, 'dominant'),
            isSecondaryDominant: true,
            appliedTo: targetRoman,
          };
        }
      }
    }
  }

  // 4) Tritone substitution (dom-quality resolving down a half-step to a diatonic chord, by next-chord context)
  if (quality === 'dom7' && next !== undefined) {
    try {
      const nextRoot = chordRootSymbol(next);
      const nextOffset = (pcOf(nextRoot) - pcOf(key.tonic) + 12) % 12;
      const expectedNext = (offset - 1 + 12) % 12;
      if (nextOffset === expectedNext) {
        const targetRoman = targetRomanForOffset(nextOffset, key.mode);
        if (targetRoman !== null) {
          return {
            ...emptyLabel(index, chord, `subV/${targetRoman}${slash}`, 'dominant'),
            isTritoneSub: true,
            appliedTo: targetRoman,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  // 5) Chromatic / unknown — fall back to chromatic base roman.
  const fallback = chromaticRomanFor(offset, quality);
  return {
    ...emptyLabel(index, chord, fallback + slash, 'chromatic'),
    isBorrowed: false,
  };
}

export function labelProgression(chords: string[], key: RomanKey): RomanLabel[] {
  return chords.map((c, i) => chordToRoman(c, key, i, chords[i + 1]));
}
