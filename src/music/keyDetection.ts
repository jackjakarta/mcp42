import { Key } from 'tonal';

import { parseChordSymbol } from './chords.js';
import { MusicInputError } from './errors.js';
import { chordQualityKey, keyDiatonicPCs, notesPCs, pcOf, type QualityKey } from './pitchClass.js';

export type KeyMode = 'major' | 'minor';
export type KeyCandidate = { key: string; score: number };

const ALL_TONICS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const SCALE_PCS_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const SCALE_PCS_MINOR = [0, 2, 3, 5, 7, 8, 10];

const TRIAD_QUALITIES_MAJOR: QualityKey[] = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
const TRIAD_QUALITIES_MINOR: QualityKey[] = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
const SEVENTH_QUALITIES_MAJOR: QualityKey[] = [
  'maj7',
  'min7',
  'min7',
  'maj7',
  'dom7',
  'min7',
  'm7b5',
];
const SEVENTH_QUALITIES_MINOR: QualityKey[] = [
  'min7',
  'm7b5',
  'maj7',
  'min7',
  'min7',
  'maj7',
  'dom7',
];

type ChordObservation = {
  symbol: string;
  rootPc: number;
  quality: QualityKey;
};

function safeObserve(symbol: string): ChordObservation | null {
  try {
    const ci = parseChordSymbol(symbol);
    return { symbol, rootPc: pcOf(ci.root), quality: chordQualityKey(symbol) };
  } catch {
    return null;
  }
}

function diatonicCredit(obs: ChordObservation, tonicPc: number, mode: KeyMode): number {
  const offset = (obs.rootPc - tonicPc + 12) % 12;
  const scalePcs = mode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
  const idx = scalePcs.indexOf(offset);
  if (idx < 0) return 0;
  const triadQ = mode === 'major' ? TRIAD_QUALITIES_MAJOR[idx] : TRIAD_QUALITIES_MINOR[idx];
  const seventhQ = mode === 'major' ? SEVENTH_QUALITIES_MAJOR[idx] : SEVENTH_QUALITIES_MINOR[idx];
  if (obs.quality === triadQ || obs.quality === seventhQ) return 1;
  // Blues color: dom7 on degree I or IV in major.
  if (mode === 'major' && obs.quality === 'dom7' && (idx === 0 || idx === 3)) return 0.5;
  return 0;
}

function rootDegreeIndex(obs: ChordObservation, tonicPc: number, mode: KeyMode): number {
  const offset = (obs.rootPc - tonicPc + 12) % 12;
  const scalePcs = mode === 'major' ? SCALE_PCS_MAJOR : SCALE_PCS_MINOR;
  return scalePcs.indexOf(offset);
}

function findCadenceBonus(
  observations: ChordObservation[],
  tonicPc: number,
  mode: KeyMode,
): number {
  let bonus = 0;
  let hasVtoI = false;
  let hasIVtoI = false;
  let hasIItoV = false;
  for (let i = 0; i < observations.length - 1; i++) {
    const a = observations[i];
    const b = observations[i + 1];
    if (a === undefined || b === undefined) continue;
    const aIdx = rootDegreeIndex(a, tonicPc, mode);
    const bIdx = rootDegreeIndex(b, tonicPc, mode);
    if (aIdx === 4 && bIdx === 0 && (a.quality === 'maj' || a.quality === 'dom7')) hasVtoI = true;
    if (aIdx === 3 && bIdx === 0) hasIVtoI = true;
    if (aIdx === 1 && bIdx === 4) hasIItoV = true;
  }
  if (hasVtoI) bonus += 3;
  if (hasIVtoI) bonus += 2;
  if (hasIItoV) bonus += 1;
  return bonus;
}

export function scoreKeyForChords(chords: string[], tonic: string, mode: KeyMode): number {
  if (chords.length === 0) return 0;
  const tonicPc = pcOf(tonic);
  const observations: ChordObservation[] = [];
  for (const c of chords) {
    const obs = safeObserve(c);
    if (obs !== null) observations.push(obs);
  }
  if (observations.length === 0) return 0;

  let D = 0;
  let P = 0;
  for (const obs of observations) {
    const credit = diatonicCredit(obs, tonicPc, mode);
    D += credit;
    if (credit === 0) P += 1;
  }

  let B = 0;
  const first = observations[0];
  const last = observations[observations.length - 1];
  if (first !== undefined && first.rootPc === tonicPc) B += 2;
  if (last !== undefined && last.rootPc === tonicPc) B += 2;

  const C = findCadenceBonus(observations, tonicPc, mode);

  let Q = 0;
  if (last !== undefined) {
    if (mode === 'major' && last.quality === 'maj7' && last.rootPc === tonicPc) Q += 1;
    if (mode === 'minor' && last.quality === 'min7' && last.rootPc === tonicPc) Q += 1;
  }

  const raw = 2 * D + B + C + Q - P;
  return Math.round((raw / chords.length) * 1000) / 1000;
}

export function scoreKeyForNotes(notes: string[], tonic: string, mode: KeyMode): number {
  if (notes.length === 0) return 0;
  const diatonic = keyDiatonicPCs(tonic, mode);
  const seen = notesPCs(notes);
  let inSet = 0;
  let outSet = 0;
  for (const pc of seen) {
    if (diatonic.has(pc)) inSet += 1;
    else outSet += 1;
  }
  return Math.round((inSet - outSet) * 1000) / 1000;
}

function preferredTonicSpelling(tonic: string, mode: KeyMode): string {
  if (mode === 'major') {
    const k = Key.majorKey(tonic);
    return k.tonic !== '' ? k.tonic : tonic;
  }
  const k = Key.minorKey(tonic);
  return k.tonic !== '' ? k.tonic : tonic;
}

export function detectKey(input: { chords?: string[]; notes?: string[] }): KeyCandidate[] {
  if (input.chords === undefined && input.notes === undefined) {
    throw new MusicInputError('Provide either `chords` or `notes` to detect a key.');
  }
  const candidates: KeyCandidate[] = [];
  for (const tonic of ALL_TONICS) {
    for (const mode of ['major', 'minor'] as const) {
      let score = 0;
      if (input.chords !== undefined) {
        score += scoreKeyForChords(input.chords, tonic, mode);
      }
      if (input.notes !== undefined) {
        score += scoreKeyForNotes(input.notes, tonic, mode);
      }
      candidates.push({
        key: `${preferredTonicSpelling(tonic, mode)} ${mode}`,
        score: Math.round(score * 1000) / 1000,
      });
    }
  }

  // Stable sort: score desc, then major before minor, then alphabetical.
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aMajor = a.key.endsWith('major');
    const bMajor = b.key.endsWith('major');
    if (aMajor !== bMajor) return aMajor ? -1 : 1;
    return a.key.localeCompare(b.key);
  });
  return candidates.slice(0, 5);
}
