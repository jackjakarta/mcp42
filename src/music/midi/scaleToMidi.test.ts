import { describe, expect, it } from 'vitest';

import { scaleToMidi } from './scaleToMidi.js';
import { decodeBase64, smfMagic } from './testUtils.js';

describe('scaleToMidi', () => {
  it('returns valid SMF and standard envelope', () => {
    const r = scaleToMidi({ tonic: 'C', type: 'major', tempo: 120, direction: 'up', octaves: 1 });
    expect(r.format).toBe('smf1');
    expect(r.ppq).toBe(480);
    expect(r.trackCount).toBe(1);
    expect(smfMagic(decodeBase64(r.midiBase64))).toBe('MThd');
  });

  it('C major up over 1 octave is 8 quarter notes (4 seconds at 120 BPM)', () => {
    const r = scaleToMidi({ tonic: 'C', type: 'major', tempo: 120, direction: 'up', octaves: 1 });
    expect(r.durationMs).toBe(4000);
  });

  it('"both" direction is 15 quarter notes (8 up + 7 down without repeating apex)', () => {
    const both = scaleToMidi({
      tonic: 'C',
      type: 'major',
      tempo: 120,
      direction: 'both',
      octaves: 1,
    });
    // 15 quarters at 120 BPM = 15 * 500ms = 7500ms
    expect(both.durationMs).toBe(7500);
  });

  it('up and down produce different bytes', () => {
    const up = scaleToMidi({ tonic: 'C', type: 'major', tempo: 120, direction: 'up', octaves: 1 });
    const down = scaleToMidi({
      tonic: 'C',
      type: 'major',
      tempo: 120,
      direction: 'down',
      octaves: 1,
    });
    expect(up.midiBase64).not.toBe(down.midiBase64);
  });

  it('rejects unknown scale type', () => {
    expect(() =>
      scaleToMidi({ tonic: 'C', type: 'not-a-scale', tempo: 120, direction: 'up', octaves: 1 }),
    ).toThrow();
  });
});
