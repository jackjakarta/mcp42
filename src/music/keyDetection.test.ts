import { describe, expect, it } from 'vitest';

import { detectKey } from './keyDetection.js';

describe('detectKey', () => {
  it('ranks C major top for ii–V–I in C', () => {
    const candidates = detectKey({ chords: ['Dm7', 'G7', 'Cmaj7'] });
    expect(candidates[0]?.key).toBe('C major');
    expect(candidates).toHaveLength(5);
  });

  it('ranks F major top for a 12-bar blues in F', () => {
    const candidates = detectKey({
      chords: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'F7', 'C7', 'Bb7', 'F7', 'C7'],
    });
    expect(candidates[0]?.key).toBe('F major');
  });

  it('returns both C major and A minor as top candidates for Am F C G', () => {
    const candidates = detectKey({ chords: ['Am', 'F', 'C', 'G'] });
    const keys = candidates.map((c) => c.key);
    expect(keys).toContain('C major');
    expect(keys).toContain('A minor');
  });

  it('ranks G major or E minor highly when given F# G A as notes', () => {
    const candidates = detectKey({ notes: ['F#', 'G', 'A'] });
    const topKeys = candidates.map((c) => c.key);
    expect(topKeys.includes('G major') || topKeys.includes('E minor')).toBe(true);
  });

  it('always returns 5 candidates, sorted by score descending', () => {
    const candidates = detectKey({ chords: ['Dm7', 'G7', 'Cmaj7'] });
    expect(candidates).toHaveLength(5);
    for (let i = 0; i < candidates.length - 1; i++) {
      const a = candidates[i];
      const b = candidates[i + 1];
      if (a !== undefined && b !== undefined) {
        expect(a.score).toBeGreaterThanOrEqual(b.score);
      }
    }
  });

  it('throws when neither chords nor notes are given', () => {
    expect(() => detectKey({})).toThrow();
  });
});
