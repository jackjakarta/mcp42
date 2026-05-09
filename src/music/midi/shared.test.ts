import { describe, expect, it } from 'vitest';

import { hashString, mulberry32, PPQ, ticksToMs } from './shared.js';

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toEqual(b());
  });
});

describe('hashString', () => {
  it('is stable for the same input', () => {
    expect(hashString('Cmaj7|120|random|4')).toBe(hashString('Cmaj7|120|random|4'));
  });

  it('differs for different inputs', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('ticksToMs', () => {
  it('converts one quarter note at 120 BPM to 500ms', () => {
    expect(ticksToMs(PPQ, 120)).toBeCloseTo(500, 5);
  });

  it('throws on non-positive tempo', () => {
    expect(() => ticksToMs(PPQ, 0)).toThrow();
  });
});
