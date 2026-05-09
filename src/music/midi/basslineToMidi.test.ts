import { describe, expect, it } from 'vitest';

import { basslineToMidi } from './basslineToMidi.js';
import { decodeBase64, smfMagic } from './testUtils.js';

describe('basslineToMidi', () => {
  it('returns valid SMF and standard envelope', () => {
    const r = basslineToMidi({
      chords: ['C', 'F', 'G', 'C'],
      tempo: 120,
      style: 'walking',
      barsPerChord: 1,
    });
    expect(r.format).toBe('smf1');
    expect(r.ppq).toBe(480);
    expect(smfMagic(decodeBase64(r.midiBase64))).toBe('MThd');
  });

  it('4 chords × 1 bar at 120 BPM = 8 seconds', () => {
    const r = basslineToMidi({
      chords: ['C', 'F', 'G', 'C'],
      tempo: 120,
      style: 'root',
      barsPerChord: 1,
    });
    expect(r.durationMs).toBe(8000);
  });

  it('root vs walking produce distinct bytes', () => {
    const chords = ['C', 'Am', 'F', 'G'];
    const root = basslineToMidi({ chords, tempo: 110, barsPerChord: 1, style: 'root' });
    const walking = basslineToMidi({ chords, tempo: 110, barsPerChord: 1, style: 'walking' });
    expect(root.midiBase64).not.toBe(walking.midiBase64);
  });

  it('rejects empty progression', () => {
    expect(() =>
      basslineToMidi({ chords: [], tempo: 120, style: 'root', barsPerChord: 1 }),
    ).toThrow();
  });
});
