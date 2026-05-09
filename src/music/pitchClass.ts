import { Chord, Key, Note } from 'tonal';

import { MusicInputError } from './errors.js';

export type PCSet = ReadonlySet<number>;

export type QualityKey =
  | 'maj'
  | 'min'
  | 'dim'
  | 'aug'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'm7b5'
  | 'other';

const STRIP_OCTAVE = /-?\d+$/;

export function pcOf(noteOrPc: string): number {
  const stripped = noteOrPc.replace(STRIP_OCTAVE, '');
  const chroma = Note.chroma(stripped);
  if (chroma === undefined) {
    throw new MusicInputError(`Invalid note or pitch class: ${noteOrPc}`);
  }
  return chroma;
}

export function rootPC(symbol: string): number {
  const chord = Chord.get(symbol);
  if (chord.empty || chord.tonic === null || chord.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }
  return pcOf(chord.tonic);
}

export function chordPCs(symbol: string): PCSet {
  const chord = Chord.get(symbol);
  if (chord.empty || chord.tonic === null || chord.tonic === '') {
    throw new MusicInputError(`Invalid chord symbol: ${symbol}`);
  }
  const pcs = new Set<number>();
  for (const note of chord.notes) {
    const c = Note.chroma(note);
    if (c !== undefined) pcs.add(c);
  }
  return pcs;
}

export function notesPCs(notes: string[]): PCSet {
  const pcs = new Set<number>();
  for (const n of notes) {
    pcs.add(pcOf(n));
  }
  return pcs;
}

export function keyDiatonicPCs(tonic: string, mode: 'major' | 'minor'): PCSet {
  const scale = keyScale(tonic, mode);
  const pcs = new Set<number>();
  for (const n of scale) {
    const c = Note.chroma(n);
    if (c !== undefined) pcs.add(c);
  }
  return pcs;
}

export function keyScale(tonic: string, mode: 'major' | 'minor'): readonly string[] {
  if (mode === 'major') {
    const k = Key.majorKey(tonic);
    if (k.scale.length === 0) {
      throw new MusicInputError(`Invalid key: ${tonic} major`);
    }
    return k.scale;
  }
  const k = Key.minorKey(tonic);
  if (k.natural.scale.length === 0) {
    throw new MusicInputError(`Invalid key: ${tonic} minor`);
  }
  return k.natural.scale;
}

export function keyDiatonicTriads(tonic: string, mode: 'major' | 'minor'): readonly string[] {
  if (mode === 'major') {
    return Key.majorKey(tonic).triads;
  }
  return Key.minorKey(tonic).natural.triads;
}

export function chordQualityKey(symbol: string): QualityKey {
  const c = Chord.get(symbol);
  if (c.empty || c.tonic === null || c.tonic === '') return 'other';
  const ivs = new Set<string>(c.intervals);
  const has = (s: string): boolean => ivs.has(s);

  if (has('3m') && has('5d') && has('7m')) return 'm7b5';
  if (has('3m') && has('5d')) return 'dim';
  if (has('3M') && has('5A')) return 'aug';
  if (has('7M') && has('3M')) return 'maj7';
  if (has('7m') && has('3M') && has('5P')) return 'dom7';
  if (has('7m') && has('3m') && has('5P')) return 'min7';
  if (has('3M') && has('5P')) return 'maj';
  if (has('3m') && has('5P')) return 'min';
  return 'other';
}

export function isDominantQuality(symbol: string): boolean {
  return chordQualityKey(symbol) === 'dom7';
}

export function isMajorTriadOrDom(symbol: string): boolean {
  const q = chordQualityKey(symbol);
  return q === 'maj' || q === 'maj7' || q === 'dom7';
}

export function isMinorish(symbol: string): boolean {
  const q = chordQualityKey(symbol);
  return q === 'min' || q === 'min7' || q === 'm7b5' || q === 'dim';
}
