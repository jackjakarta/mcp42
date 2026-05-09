import { describe, expect, it } from 'vitest';

import { findCadences } from './cadences.js';
import { labelProgression } from './romanAnalysis.js';

const CMAJ = { tonic: 'C', mode: 'major' } as const;
const AMIN = { tonic: 'A', mode: 'minor' } as const;

describe('findCadences', () => {
  it('detects perfect-authentic V→I (root-position)', () => {
    const labels = labelProgression(['G', 'C'], CMAJ);
    const cadences = findCadences(labels, 'major');
    expect(cadences).toHaveLength(1);
    expect(cadences[0]?.type).toBe('perfect-authentic');
    expect(cadences[0]?.index).toBe(1);
  });

  it('downgrades to authentic when an inversion is present', () => {
    const labels = labelProgression(['G/B', 'C'], CMAJ);
    const cadences = findCadences(labels, 'major');
    expect(cadences[0]?.type).toBe('authentic');
  });

  it('detects plagal IV→I', () => {
    const labels = labelProgression(['F', 'C'], CMAJ);
    const cadences = findCadences(labels, 'major');
    expect(cadences).toHaveLength(1);
    expect(cadences[0]?.type).toBe('plagal');
  });

  it('detects deceptive V→vi', () => {
    const labels = labelProgression(['G', 'Am'], CMAJ);
    const cadences = findCadences(labels, 'major');
    expect(cadences[0]?.type).toBe('deceptive');
  });

  it('detects half cadence at the end of a progression', () => {
    const labels = labelProgression(['C', 'F', 'G'], CMAJ);
    const cadences = findCadences(labels, 'major');
    const halfs = cadences.filter((c) => c.type === 'half');
    expect(halfs).toHaveLength(1);
    expect(halfs[0]?.index).toBe(2);
  });

  it('detects phrygian iv→V in minor', () => {
    const labels = labelProgression(['Dm', 'E'], AMIN);
    const cadences = findCadences(labels, 'minor');
    const phr = cadences.filter((c) => c.type === 'phrygian');
    expect(phr.length).toBeGreaterThanOrEqual(1);
  });
});
