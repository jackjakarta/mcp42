import { describe, expect, it } from 'vitest';

import { progressionToMidi } from './progressionToMidi.js';
import { decodeBase64, smfMagic } from './testUtils.js';

describe('progressionToMidi', () => {
  it('returns the standard envelope and a valid SMF header', () => {
    const r = progressionToMidi({
      chords: ['C', 'Am', 'F', 'G'],
      tempo: 120,
      voicing: 'block',
      barsPerChord: 1,
    });
    expect(r.format).toBe('smf1');
    expect(r.ppq).toBe(480);
    expect(r.trackCount).toBe(1);
    expect(smfMagic(decodeBase64(r.midiBase64))).toBe('MThd');
  });

  it('computes durationMs from bars and tempo', () => {
    const r = progressionToMidi({
      chords: ['C', 'F'],
      tempo: 120,
      voicing: 'block',
      barsPerChord: 1,
    });
    // 2 chords * 1 bar * 4 beats / (120/60) = 4 seconds
    expect(r.durationMs).toBe(4000);
  });

  it('produces distinct output bytes per voicing', () => {
    const chords = ['Cmaj7', 'Dm7', 'G7'];
    const block = progressionToMidi({
      chords,
      tempo: 110,
      barsPerChord: 1,
      voicing: 'block',
    }).midiBase64;
    const up = progressionToMidi({
      chords,
      tempo: 110,
      barsPerChord: 1,
      voicing: 'arpeggio-up',
    }).midiBase64;
    const down = progressionToMidi({
      chords,
      tempo: 110,
      barsPerChord: 1,
      voicing: 'arpeggio-down',
    }).midiBase64;
    const broken = progressionToMidi({
      chords,
      tempo: 110,
      barsPerChord: 1,
      voicing: 'broken',
    }).midiBase64;
    expect(new Set([block, up, down, broken]).size).toBe(4);
  });

  it('rejects invalid chord symbols', () => {
    expect(() =>
      progressionToMidi({
        chords: ['NotAChord'],
        tempo: 120,
        voicing: 'block',
        barsPerChord: 1,
      }),
    ).toThrow();
  });
});
