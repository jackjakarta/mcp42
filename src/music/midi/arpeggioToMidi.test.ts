import { describe, expect, it } from 'vitest';

import { arpeggioToMidi } from './arpeggioToMidi.js';
import { decodeBase64, smfMagic } from './testUtils.js';

describe('arpeggioToMidi', () => {
  it('returns valid SMF and standard envelope', () => {
    const r = arpeggioToMidi({ chord: 'Cmaj7', tempo: 120, pattern: 'up', bars: 1 });
    expect(r.format).toBe('smf1');
    expect(r.ppq).toBe(480);
    expect(smfMagic(decodeBase64(r.midiBase64))).toBe('MThd');
  });

  it('1 bar at 120 BPM = 2000ms', () => {
    const r = arpeggioToMidi({ chord: 'Cmaj7', tempo: 120, pattern: 'up', bars: 1 });
    expect(r.durationMs).toBe(2000);
  });

  it('up and down produce different bytes for the same chord', () => {
    const args = { chord: 'Cmaj7', tempo: 120, bars: 2 } as const;
    const up = arpeggioToMidi({ ...args, pattern: 'up' });
    const down = arpeggioToMidi({ ...args, pattern: 'down' });
    expect(up.midiBase64).not.toBe(down.midiBase64);
  });

  it('random pattern is deterministic for the same input', () => {
    const args = { chord: 'Cmaj7', tempo: 120, pattern: 'random', bars: 4 } as const;
    const a = arpeggioToMidi(args);
    const b = arpeggioToMidi(args);
    expect(a.midiBase64).toBe(b.midiBase64);
  });

  it('random output differs from up/down', () => {
    const args = { chord: 'Cmaj7', tempo: 120, bars: 4 } as const;
    const random = arpeggioToMidi({ ...args, pattern: 'random' });
    const up = arpeggioToMidi({ ...args, pattern: 'up' });
    expect(random.midiBase64).not.toBe(up.midiBase64);
  });
});
