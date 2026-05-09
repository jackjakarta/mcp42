import MidiWriter from 'midi-writer-js';

import { MusicInputError } from '../errors.js';
import { encodeSmf, hashString, mulberry32, PPQ, type MidiResult } from './shared.js';
import { arpeggiate, chordToPitches, type ArpeggioPattern } from './voicing.js';

export type ArpeggioToMidiInput = {
  chord: string;
  tempo: number;
  pattern: ArpeggioPattern;
  bars: number;
};

const SIXTEENTHS_PER_BAR = 16;

export function arpeggioToMidi(input: ArpeggioToMidiInput): MidiResult {
  const { chord, tempo, pattern, bars } = input;
  if (bars < 1) throw new MusicInputError('bars must be >= 1');

  const pitches = chordToPitches(chord, 4);
  const noteCount = bars * SIXTEENTHS_PER_BAR;

  const seed = hashString(`${chord}|${tempo}|${pattern}|${bars}`);
  const rng = pattern === 'random' ? mulberry32(seed) : undefined;
  const sequence = arpeggiate(pitches, pattern, noteCount, rng);

  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);
  for (const p of sequence) {
    track.addEvent(new MidiWriter.NoteEvent({ pitch: [p], duration: '16', velocity: 88 }));
  }

  const totalTicks = noteCount * (PPQ / 4);
  return encodeSmf([track], totalTicks, tempo);
}
