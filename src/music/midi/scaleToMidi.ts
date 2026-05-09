import MidiWriter from 'midi-writer-js';
import { Note } from 'tonal';

import { MusicInputError } from '../errors.js';
import { getScale } from '../scales.js';
import { encodeSmf, PPQ, type MidiResult } from './shared.js';

export type ScaleDirection = 'up' | 'down' | 'both';

export type ScaleToMidiInput = {
  tonic: string;
  type: string;
  tempo: number;
  direction: ScaleDirection;
  octaves: number;
};

export function scaleToMidi(input: ScaleToMidiInput): MidiResult {
  const { tonic, type, tempo, direction, octaves } = input;
  if (octaves < 1) throw new MusicInputError('octaves must be >= 1');

  const scale = getScale(tonic, type);
  const pitches = expandScalePitches(scale.notes, 4, octaves);

  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);

  const sequence = buildSequence(pitches, direction);
  for (const p of sequence) {
    track.addEvent(new MidiWriter.NoteEvent({ pitch: [p], duration: '4', velocity: 90 }));
  }

  const totalTicks = sequence.length * PPQ;
  return encodeSmf([track], totalTicks, tempo);
}

function expandScalePitches(
  scaleNotes: readonly string[],
  baseOctave: number,
  octaves: number,
): string[] {
  const fallbackPc = scaleNotes[0];
  if (fallbackPc === undefined) {
    throw new MusicInputError('scale has no notes');
  }
  const out: string[] = [];
  let prevMidi = Number.NEGATIVE_INFINITY;
  let octave = baseOctave;

  for (let oct = 0; oct < octaves; oct++) {
    for (const pc of scaleNotes) {
      let placed = false;
      while (octave <= 9) {
        const candidate = `${pc}${octave}`;
        const m = Note.midi(candidate);
        if (m === null || m === undefined) {
          throw new MusicInputError(`Invalid scale tone: ${candidate}`);
        }
        if (m > prevMidi) {
          out.push(candidate);
          prevMidi = m;
          placed = true;
          break;
        }
        octave++;
      }
      if (!placed) {
        throw new MusicInputError(`Cannot fit scale within range starting at octave ${baseOctave}`);
      }
    }
  }

  // close on the next tonic an octave above the last starting tonic
  const tonicPc = fallbackPc;
  let topOctave = octave;
  while (topOctave <= 9) {
    const candidate = `${tonicPc}${topOctave}`;
    const m = Note.midi(candidate);
    if (m === null || m === undefined) break;
    if (m > prevMidi) {
      out.push(candidate);
      break;
    }
    topOctave++;
  }
  return out;
}

function buildSequence(pitches: string[], direction: ScaleDirection): string[] {
  if (direction === 'up') return pitches;
  if (direction === 'down') return [...pitches].reverse();
  // both: ascending then descending without repeating the apex
  const apex = pitches[pitches.length - 1];
  const descending = [...pitches].reverse();
  if (apex === undefined) return pitches;
  return [...pitches, ...descending.slice(1)];
}
