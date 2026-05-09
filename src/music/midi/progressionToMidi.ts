import MidiWriter, { type Track } from 'midi-writer-js';

import { MusicInputError } from '../errors.js';
import { encodeSmf, PPQ, type MidiResult } from './shared.js';
import { chordToPitches } from './voicing.js';

export type ProgressionVoicing = 'block' | 'arpeggio-up' | 'arpeggio-down' | 'broken';

export type ProgressionToMidiInput = {
  chords: string[];
  tempo: number;
  voicing: ProgressionVoicing;
  barsPerChord: number;
};

export function progressionToMidi(input: ProgressionToMidiInput): MidiResult {
  const { chords, tempo, voicing, barsPerChord } = input;
  if (chords.length === 0) throw new MusicInputError('chords cannot be empty');
  if (barsPerChord < 1) throw new MusicInputError('barsPerChord must be >= 1');

  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);

  for (const symbol of chords) {
    const pitches = chordToPitches(symbol, 4);
    addChord(track, pitches, voicing, barsPerChord);
  }

  const totalTicks = chords.length * barsPerChord * 4 * PPQ;
  return encodeSmf([track], totalTicks, tempo);
}

function addChord(
  track: Track,
  pitches: string[],
  voicing: ProgressionVoicing,
  barsPerChord: number,
): void {
  switch (voicing) {
    case 'block':
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: pitches,
          duration: '1',
          repeat: barsPerChord,
          velocity: 90,
        }),
      );
      return;

    case 'arpeggio-up':
    case 'arpeggio-down': {
      const ordered = voicing === 'arpeggio-up' ? pitches : [...pitches].reverse();
      const fallback = ordered[0];
      if (fallback === undefined) return;
      for (let bar = 0; bar < barsPerChord; bar++) {
        for (let i = 0; i < 8; i++) {
          const p = ordered[i % ordered.length] ?? fallback;
          track.addEvent(new MidiWriter.NoteEvent({ pitch: [p], duration: '8', velocity: 85 }));
        }
      }
      return;
    }

    case 'broken': {
      const [root, ...upper] = pitches;
      if (root === undefined) return;
      const upperFallback = upper[0] ?? root;
      for (let bar = 0; bar < barsPerChord; bar++) {
        track.addEvent(new MidiWriter.NoteEvent({ pitch: [root], duration: '4', velocity: 95 }));
        for (let i = 0; i < 6; i++) {
          const p = upper.length > 0 ? (upper[i % upper.length] ?? upperFallback) : root;
          track.addEvent(new MidiWriter.NoteEvent({ pitch: [p], duration: '8', velocity: 80 }));
        }
      }
      return;
    }
  }
}
