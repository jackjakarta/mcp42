import { type RomanLabel } from './romanAnalysis.js';

export type CadenceType =
  | 'authentic'
  | 'perfect-authentic'
  | 'plagal'
  | 'half'
  | 'deceptive'
  | 'phrygian';

export type Cadence = {
  type: CadenceType;
  index: number;
  chords: [string, string];
  romans: [string, string];
};

function stripExtensions(roman: string): string {
  return roman
    .replace(/maj7$/i, '')
    .replace(/ø7$/, '°')
    .replace(/7$/, '')
    .replace(/9$/, '')
    .replace(/11$/, '')
    .replace(/13$/, '')
    .replace(/sus[24]?$/i, '');
}

function baseRoman(label: RomanLabel): string {
  if (label.isSecondaryDominant || label.isTritoneSub) return '';
  const beforeSlash = label.roman.split('/')[0] ?? '';
  return stripExtensions(beforeSlash);
}

function isInverted(label: RomanLabel): boolean {
  return label.chord.includes('/');
}

function isDominantHead(label: RomanLabel): boolean {
  if (label.isSecondaryDominant || label.isTritoneSub) return false;
  const r = baseRoman(label);
  return r === 'V' || r === 'v';
}

export function findCadences(romans: RomanLabel[], mode: 'major' | 'minor'): Cadence[] {
  const cadences: Cadence[] = [];
  const tonicRoman = mode === 'major' ? 'I' : 'i';
  const subdominantRoman = mode === 'major' ? 'IV' : 'iv';
  const submediantRoman = mode === 'major' ? 'vi' : 'VI';
  const dominantRomans = mode === 'major' ? ['V'] : ['V', 'v'];

  for (let i = 0; i < romans.length - 1; i++) {
    const a = romans[i];
    const b = romans[i + 1];
    if (a === undefined || b === undefined) continue;
    const aBase = baseRoman(a);
    const bBase = baseRoman(b);

    // Authentic (V → I) and perfect-authentic when both root-position.
    if (dominantRomans.includes(aBase) && bBase === tonicRoman) {
      const type: CadenceType =
        aBase === 'V' && !isInverted(a) && !isInverted(b) ? 'perfect-authentic' : 'authentic';
      cadences.push({
        type,
        index: i + 1,
        chords: [a.chord, b.chord],
        romans: [a.roman, b.roman],
      });
      continue;
    }

    // Plagal (IV → I)
    if (aBase === subdominantRoman && bBase === tonicRoman) {
      cadences.push({
        type: 'plagal',
        index: i + 1,
        chords: [a.chord, b.chord],
        romans: [a.roman, b.roman],
      });
      continue;
    }

    // Deceptive (V → vi/VI)
    if (dominantRomans.includes(aBase) && bBase === submediantRoman) {
      cadences.push({
        type: 'deceptive',
        index: i + 1,
        chords: [a.chord, b.chord],
        romans: [a.roman, b.roman],
      });
      continue;
    }

    // Phrygian: bII → I, or iv → V (minor key).
    if (aBase === 'bII' && bBase === tonicRoman) {
      cadences.push({
        type: 'phrygian',
        index: i + 1,
        chords: [a.chord, b.chord],
        romans: [a.roman, b.roman],
      });
      continue;
    }
    if (mode === 'minor' && aBase === 'iv' && (bBase === 'V' || bBase === 'v')) {
      cadences.push({
        type: 'phrygian',
        index: i + 1,
        chords: [a.chord, b.chord],
        romans: [a.roman, b.roman],
      });
      continue;
    }
  }

  // Half cadence: only at the very end of the progression, when the final chord is dominant.
  if (romans.length >= 2) {
    const last = romans[romans.length - 1];
    const prev = romans[romans.length - 2];
    if (last !== undefined && prev !== undefined && isDominantHead(last)) {
      const lastBase = baseRoman(last);
      const prevBase = baseRoman(prev);
      // Avoid double-counting: skip if the previous-pair already produced a cadence ending here.
      const alreadyEmitted = cadences.some((c) => c.index === romans.length - 1);
      if (!alreadyEmitted && prevBase !== '' && lastBase !== '') {
        cadences.push({
          type: 'half',
          index: romans.length - 1,
          chords: [prev.chord, last.chord],
          romans: [prev.roman, last.roman],
        });
      }
    }
  }

  return cadences;
}
