import { describe, expect, it } from 'vitest';

import { suggestSubstitutions } from './substitutions.js';

const CMAJ = { tonic: 'C', mode: 'major' } as const;

describe('suggestSubstitutions', () => {
  it('suggests Db7 (subV/I) and D7 (V7/V) for G7 in C major', () => {
    const r = suggestSubstitutions('G7', CMAJ);
    expect(r.tritoneSub?.symbol).toBe('Db7');
    expect(r.tritoneSub?.roman).toBe('subV/I');
    expect(r.secondaryDominant?.symbol).toBe('D7');
    expect(r.secondaryDominant?.roman).toBe('V7/V');
  });

  it('includes parallel-minor borrowings (Fm, Eb, Ab, Bb) for C major', () => {
    const r = suggestSubstitutions('G7', CMAJ);
    const symbols = r.borrowedChords.map((b) => b.symbol);
    for (const expected of ['Fm', 'Eb', 'Ab', 'Bb']) {
      expect(symbols).toContain(expected);
    }
    expect(r.borrowedChords.every((b) => b.sourceMode === 'parallel-minor')).toBe(true);
  });

  it('omits tritoneSub for non-dominant chords', () => {
    const r = suggestSubstitutions('Dm', CMAJ);
    expect(r.tritoneSub).toBeUndefined();
    expect(r.secondaryDominant?.symbol).toBe('A7');
    expect(r.borrowedChords.length).toBeGreaterThan(0);
  });

  it('omits secondaryDominant when chord is the tonic', () => {
    const r = suggestSubstitutions('C', CMAJ);
    expect(r.secondaryDominant).toBeUndefined();
  });

  it('includes a phrygian-mode chord in modal interchange for C major', () => {
    const r = suggestSubstitutions('G7', CMAJ);
    const phrygian = r.modalInterchange.filter((m) => m.sourceMode === 'phrygian');
    expect(phrygian.length).toBeGreaterThan(0);
  });
});
