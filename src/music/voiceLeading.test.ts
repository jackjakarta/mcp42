import { describe, expect, it } from 'vitest';

import { analyzeVoiceLeading } from './voiceLeading.js';

describe('analyzeVoiceLeading', () => {
  it('flags parallel fifths', () => {
    const r = analyzeVoiceLeading(
      { chord: 'C', voicing: ['C4', 'G4'] },
      { chord: 'D', voicing: ['D4', 'A4'] },
    );
    expect(r.warnings.some((w) => w.type === 'parallel-fifths')).toBe(true);
  });

  it('flags parallel octaves', () => {
    const r = analyzeVoiceLeading(
      { chord: 'C', voicing: ['C4', 'C5'] },
      { chord: 'D', voicing: ['D4', 'D5'] },
    );
    expect(r.warnings.some((w) => w.type === 'parallel-octaves')).toBe(true);
  });

  it('flags a leap larger than an octave', () => {
    const r = analyzeVoiceLeading(
      { chord: 'C', voicing: ['C4', 'E4'] },
      { chord: 'F', voicing: ['C4', 'F5'] },
    );
    const leaps = r.warnings.filter((w) => w.type === 'large-leap');
    expect(leaps.length).toBe(1);
    expect((leaps[0] as { voice: number }).voice).toBe(1);
  });

  it('returns no warnings for a clean ii–V–I voicing pair', () => {
    const r = analyzeVoiceLeading(
      { chord: 'Dm7', voicing: ['D4', 'F4', 'A4', 'C5'] },
      { chord: 'G7', voicing: ['G3', 'F4', 'B4', 'D5'] },
    );
    expect(r.warnings.filter((w) => w.type === 'parallel-fifths')).toHaveLength(0);
    expect(r.warnings.filter((w) => w.type === 'parallel-octaves')).toHaveLength(0);
  });

  it('throws when voicings have mismatched length', () => {
    expect(() =>
      analyzeVoiceLeading({ chord: 'C', voicing: ['C4', 'E4'] }, { chord: 'D', voicing: ['D4'] }),
    ).toThrow();
  });

  it('returns per-voice motion paired by index', () => {
    const r = analyzeVoiceLeading(
      { chord: 'C', voicing: ['C4', 'E4', 'G4'] },
      { chord: 'F', voicing: ['C4', 'F4', 'A4'] },
    );
    expect(r.perVoice).toHaveLength(3);
    expect(r.perVoice[0]?.semitones).toBe(0);
    expect(r.perVoice[0]?.direction).toBe('static');
    expect(r.perVoice[1]?.semitones).toBe(1);
    expect(r.perVoice[2]?.semitones).toBe(2);
  });
});
