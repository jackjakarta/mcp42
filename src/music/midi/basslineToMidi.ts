import MidiWriter, { type Track } from 'midi-writer-js';
import { Chord, Note } from 'tonal';

import { MusicInputError } from '../errors.js';
import { encodeSmf, PPQ, type MidiResult } from './shared.js';

export type BasslineStyle = 'root' | 'root-fifth' | 'walking';

export type BasslineToMidiInput = {
  chords: string[];
  tempo: number;
  style: BasslineStyle;
  barsPerChord: number;
};

type Triad = { root: string; third: string; fifth: string };

export function basslineToMidi(input: BasslineToMidiInput): MidiResult {
  const { chords, tempo, style, barsPerChord } = input;
  if (chords.length === 0) throw new MusicInputError('chords cannot be empty');
  if (barsPerChord < 1) throw new MusicInputError('barsPerChord must be >= 1');

  const track = new MidiWriter.Track();
  track.setTempo(tempo);
  track.setTimeSignature(4, 4, 24, 8);

  for (let i = 0; i < chords.length; i++) {
    const symbol = chords[i];
    if (symbol === undefined) continue;
    const triad = triadAt(symbol, 2);
    const nextSymbol = chords[i + 1];
    const nextRoot = nextSymbol !== undefined ? rootAt(nextSymbol, 2) : triad.root;

    for (let bar = 0; bar < barsPerChord; bar++) {
      const isLastBarOfChord = bar === barsPerChord - 1;
      const approachTarget = isLastBarOfChord ? nextRoot : triad.root;
      addBar(track, triad, approachTarget, style);
    }
  }

  const totalTicks = chords.length * barsPerChord * 4 * PPQ;
  return encodeSmf([track], totalTicks, tempo);
}

function addBar(track: Track, triad: Triad, approachTarget: string, style: BasslineStyle): void {
  const velocity = 95;
  switch (style) {
    case 'root':
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.root], duration: '1', velocity }));
      return;
    case 'root-fifth':
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.root], duration: '2', velocity }));
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.fifth], duration: '2', velocity }));
      return;
    case 'walking':
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.root], duration: '4', velocity }));
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.third], duration: '4', velocity }));
      track.addEvent(new MidiWriter.NoteEvent({ pitch: [triad.fifth], duration: '4', velocity }));
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [chromaticBelow(approachTarget)],
          duration: '4',
          velocity,
        }),
      );
      return;
  }
}

function triadAt(symbol: string, octave: number): Triad {
  const c = Chord.get(symbol);
  if (c.empty || c.tonic === null || c.tonic === '' || c.notes.length < 3) {
    throw new MusicInputError(`Cannot extract triad from chord: ${symbol}`);
  }
  const [r, t, f] = c.notes;
  if (r === undefined || t === undefined || f === undefined) {
    throw new MusicInputError(`Cannot extract triad from chord: ${symbol}`);
  }
  return {
    root: assertPitch(`${r}${octave}`),
    third: ascendingFrom(`${r}${octave}`, `${t}${octave}`),
    fifth: ascendingFrom(`${r}${octave}`, `${f}${octave}`),
  };
}

function rootAt(symbol: string, octave: number): string {
  const c = Chord.get(symbol);
  if (c.empty || c.tonic === null || c.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }
  return assertPitch(`${c.tonic}${octave}`);
}

function ascendingFrom(reference: string, candidate: string): string {
  const refMidi = Note.midi(reference);
  let candMidi = Note.midi(candidate);
  if (refMidi === null || refMidi === undefined || candMidi === null || candMidi === undefined) {
    throw new MusicInputError(`Invalid pitch reference: ${reference} / ${candidate}`);
  }
  let result = candidate;
  while (candMidi <= refMidi) {
    candMidi += 12;
    const next = Note.fromMidi(candMidi);
    if (!next) throw new MusicInputError(`Pitch out of range: ${candidate}`);
    result = next;
  }
  return result;
}

function chromaticBelow(pitch: string): string {
  const m = Note.midi(pitch);
  if (m === null || m === undefined) {
    throw new MusicInputError(`Invalid pitch: ${pitch}`);
  }
  const below = Note.fromMidi(m - 1);
  if (!below) throw new MusicInputError(`Pitch out of range below: ${pitch}`);
  return below;
}

function assertPitch(pitch: string): string {
  const m = Note.midi(pitch);
  if (m === null || m === undefined) {
    throw new MusicInputError(`Invalid pitch: ${pitch}`);
  }
  return pitch;
}
