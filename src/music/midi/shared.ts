import MidiWriter, { type Track } from 'midi-writer-js';

import { MusicInputError } from '../errors.js';

export const PPQ = 480;
export const MIDI_FORMAT = 'smf1' as const;

export type MidiResult = {
  midiBase64: string;
  format: typeof MIDI_FORMAT;
  ppq: typeof PPQ;
  durationMs: number;
  trackCount: number;
};

export function encodeSmf(tracks: Track[], totalTicks: number, tempoBpm: number): MidiResult {
  if (tracks.length === 0) {
    throw new MusicInputError('Cannot encode an SMF with zero tracks.');
  }
  const writer = new MidiWriter.Writer(tracks, { ticksPerBeat: PPQ });
  return {
    midiBase64: writer.base64(),
    format: MIDI_FORMAT,
    ppq: PPQ,
    durationMs: Math.round(ticksToMs(totalTicks, tempoBpm)),
    trackCount: tracks.length,
  };
}

export function ticksToMs(ticks: number, bpm: number): number {
  if (bpm <= 0) throw new MusicInputError(`tempo must be positive, got ${bpm}`);
  const beats = ticks / PPQ;
  return (beats / bpm) * 60_000;
}

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
