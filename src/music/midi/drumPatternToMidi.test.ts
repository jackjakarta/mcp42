import { describe, expect, it } from 'vitest';

import { drumPatternToMidi } from './drumPatternToMidi.js';
import { containsByte, decodeBase64, smfMagic } from './testUtils.js';

describe('drumPatternToMidi', () => {
  it('returns valid SMF and standard envelope', () => {
    const r = drumPatternToMidi({ pattern: 'rock-basic', tempo: 120, bars: 1 });
    expect(r.format).toBe('smf1');
    expect(r.ppq).toBe(480);
    expect(r.trackCount).toBe(1);
    expect(smfMagic(decodeBase64(r.midiBase64))).toBe('MThd');
  });

  it('emits note-on events on channel 10 (status byte 0x99)', () => {
    const r = drumPatternToMidi({ pattern: 'rock-basic', tempo: 120, bars: 1 });
    const bytes = decodeBase64(r.midiBase64);
    expect(containsByte(bytes, 0x99)).toBe(true);
  });

  it('2 bars at 120 BPM = 4000ms', () => {
    const r = drumPatternToMidi({ pattern: 'rock-basic', tempo: 120, bars: 2 });
    expect(r.durationMs).toBe(4000);
  });

  it('different patterns produce distinct bytes', () => {
    const rock = drumPatternToMidi({ pattern: 'rock-basic', tempo: 120, bars: 2 });
    const swing = drumPatternToMidi({ pattern: 'swing', tempo: 120, bars: 2 });
    const bossa = drumPatternToMidi({ pattern: 'latin-bossa', tempo: 120, bars: 2 });
    const funk = drumPatternToMidi({ pattern: 'funk-16th', tempo: 120, bars: 2 });
    const set = new Set([rock.midiBase64, swing.midiBase64, bossa.midiBase64, funk.midiBase64]);
    expect(set.size).toBe(4);
  });
});
