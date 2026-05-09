import MidiWriter from 'midi-writer-js';
import { Note } from 'tonal';

import { MusicInputError } from '../errors.js';
import { encodeSmf, PPQ, type MidiResult } from './shared.js';

export type DrumPatternKey = 'rock-basic' | 'swing' | 'latin-bossa' | 'funk-16th';

export type DrumPatternToMidiInput = {
  pattern: DrumPatternKey;
  tempo: number;
  bars: number;
};

const DRUM_CHANNEL = 10;
const BAR_TICKS = 4 * PPQ;
const SIXTEENTH = PPQ / 4;
const TRIPLET_EIGHTH = PPQ / 3;

const KICK = 36;
const SNARE = 38;
const CLOSED_HAT = 42;
const OPEN_HAT = 46;
const RIDE = 51;
const SIDE_STICK = 37;

type DrumHit = { tick: number; pitch: number; velocity: number };

export function drumPatternToMidi(input: DrumPatternToMidiInput): MidiResult {
  const { pattern, tempo, bars } = input;
  if (bars < 1) throw new MusicInputError('bars must be >= 1');

  const builder = PATTERNS[pattern];
  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);

  for (let bar = 0; bar < bars; bar++) {
    const barStart = bar * BAR_TICKS;
    for (const hit of builder(barStart)) {
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [pitchName(hit.pitch)],
          duration: '16',
          velocity: hit.velocity,
          channel: DRUM_CHANNEL,
          startTick: hit.tick,
        }),
      );
    }
  }

  return encodeSmf([track], bars * BAR_TICKS, tempo);
}

function pitchName(midi: number): string {
  const name = Note.fromMidi(midi);
  if (!name) throw new MusicInputError(`Invalid drum MIDI number: ${midi}`);
  return name;
}

const PATTERNS: Record<DrumPatternKey, (barStart: number) => DrumHit[]> = {
  'rock-basic': (s) => [
    // Kick on beats 1, 3
    { tick: s + 0 * SIXTEENTH, pitch: KICK, velocity: 100 },
    { tick: s + 8 * SIXTEENTH, pitch: KICK, velocity: 100 },
    // Snare on beats 2, 4
    { tick: s + 4 * SIXTEENTH, pitch: SNARE, velocity: 95 },
    { tick: s + 12 * SIXTEENTH, pitch: SNARE, velocity: 95 },
    // Closed hat on every eighth (8 per bar)
    ...Array.from({ length: 8 }, (_, i) => ({
      tick: s + i * 2 * SIXTEENTH,
      pitch: CLOSED_HAT,
      velocity: 75,
    })),
  ],

  swing: (s) => [
    // Kick on beats 1, 3
    { tick: s + 0, pitch: KICK, velocity: 95 },
    { tick: s + 6 * TRIPLET_EIGHTH, pitch: KICK, velocity: 95 },
    // Snare on beats 2, 4 (ghost)
    { tick: s + 3 * TRIPLET_EIGHTH, pitch: SNARE, velocity: 65 },
    { tick: s + 9 * TRIPLET_EIGHTH, pitch: SNARE, velocity: 65 },
    // Ride: ding–ding-a (quarter + last triplet) per beat → 8 hits
    ...[0, 2, 3, 5, 6, 8, 9, 11].map((slot) => ({
      tick: s + slot * TRIPLET_EIGHTH,
      pitch: RIDE,
      velocity: slot % 3 === 0 ? 90 : 70,
    })),
  ],

  'latin-bossa': (s) => [
    // Kick: beat 1, "& of 2" (slot 5), beat 3
    { tick: s + 0, pitch: KICK, velocity: 95 },
    { tick: s + 5 * SIXTEENTH, pitch: KICK, velocity: 90 },
    { tick: s + 8 * SIXTEENTH, pitch: KICK, velocity: 95 },
    // Side-stick bossa clave (3-side per bar)
    { tick: s + 0, pitch: SIDE_STICK, velocity: 80 },
    { tick: s + 3 * SIXTEENTH, pitch: SIDE_STICK, velocity: 80 },
    { tick: s + 6 * SIXTEENTH, pitch: SIDE_STICK, velocity: 80 },
    { tick: s + 10 * SIXTEENTH, pitch: SIDE_STICK, velocity: 80 },
    { tick: s + 12 * SIXTEENTH, pitch: SIDE_STICK, velocity: 80 },
    // Closed hat: every eighth (8 per bar)
    ...Array.from({ length: 8 }, (_, i) => ({
      tick: s + i * 2 * SIXTEENTH,
      pitch: CLOSED_HAT,
      velocity: 70,
    })),
  ],

  'funk-16th': (s) => [
    // Syncopated kick: 1, "e of 1" missed; "and of 2" (slot 6), "and of 3" (slot 10), 4 (slot 12)
    { tick: s + 0, pitch: KICK, velocity: 100 },
    { tick: s + 3 * SIXTEENTH, pitch: KICK, velocity: 95 },
    { tick: s + 6 * SIXTEENTH, pitch: KICK, velocity: 95 },
    { tick: s + 10 * SIXTEENTH, pitch: KICK, velocity: 95 },
    // Snare on 2, 4
    { tick: s + 4 * SIXTEENTH, pitch: SNARE, velocity: 95 },
    { tick: s + 12 * SIXTEENTH, pitch: SNARE, velocity: 95 },
    // Closed hat sixteenths with open hat accent on "& of 4" (slot 14)
    ...Array.from({ length: 16 }, (_, i) => ({
      tick: s + i * SIXTEENTH,
      pitch: i === 14 ? OPEN_HAT : CLOSED_HAT,
      velocity: i % 4 === 0 ? 80 : 65,
    })),
  ],
};
