import { describe, expect, it } from 'vitest';

import { labelProgression } from './romanAnalysis.js';

const CMAJ = { tonic: 'C', mode: 'major' } as const;
const FMAJ = { tonic: 'F', mode: 'major' } as const;

describe('labelProgression', () => {
  it('labels diatonic ii7–V7–Imaj7 in C major', () => {
    const labels = labelProgression(['Dm7', 'G7', 'Cmaj7'], CMAJ);
    expect(labels.map((l) => l.roman)).toEqual(['ii7', 'V7', 'Imaj7']);
    expect(labels.every((l) => l.isDiatonic)).toBe(true);
  });

  it('labels bVII as borrowed in C major', () => {
    const labels = labelProgression(['C', 'Bb', 'C'], CMAJ);
    expect(labels.map((l) => l.roman)).toEqual(['I', 'bVII', 'I']);
    expect(labels[1]?.isBorrowed).toBe(true);
    expect(labels[0]?.isDiatonic).toBe(true);
  });

  it('labels D7 as V7/V in C major when G follows', () => {
    const labels = labelProgression(['C', 'D7', 'G'], CMAJ);
    expect(labels.map((l) => l.roman)).toEqual(['I', 'V7/V', 'V']);
    expect(labels[1]?.isSecondaryDominant).toBe(true);
    expect(labels[1]?.appliedTo).toBe('V');
  });

  it('labels Db7 as subV/I when Cmaj7 follows', () => {
    const labels = labelProgression(['Cmaj7', 'Db7', 'Cmaj7'], CMAJ);
    expect(labels[1]?.roman).toBe('subV/I');
    expect(labels[1]?.isTritoneSub).toBe(true);
  });

  it('labels Am/C with slash bass as vi/I in C major', () => {
    const labels = labelProgression(['Am/C', 'F', 'G'], CMAJ);
    expect(labels[0]?.roman).toBe('vi/I');
  });

  it('labels a 12-bar blues in F as I7 IV7 ... V7', () => {
    const labels = labelProgression(
      ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'F7', 'C7', 'Bb7', 'F7', 'C7'],
      FMAJ,
    );
    expect(labels.map((l) => l.roman)).toEqual([
      'I7',
      'IV7',
      'I7',
      'I7',
      'IV7',
      'IV7',
      'I7',
      'I7',
      'V7',
      'IV7',
      'I7',
      'V7',
    ]);
    expect(labels.every((l) => l.isDiatonic)).toBe(true);
  });
});
