import { Note } from 'tonal';

import { MusicInputError } from './errors.js';

export type VoiceMove = {
  from: string;
  to: string;
  semitones: number;
  direction: 'up' | 'down' | 'static';
};

export type VoiceWarning =
  | { type: 'parallel-fifths' | 'parallel-octaves'; voices: [number, number] }
  | { type: 'large-leap'; voice: number; semitones: number };

export type VoiceLeadingReport = {
  perVoice: VoiceMove[];
  warnings: VoiceWarning[];
};

function midiOf(note: string): number {
  const m = Note.midi(note);
  if (m === null || m === undefined) {
    throw new MusicInputError(`Invalid pitch (needs scientific pitch like "C4"): ${note}`);
  }
  return m;
}

function directionOf(semitones: number): 'up' | 'down' | 'static' {
  if (semitones > 0) return 'up';
  if (semitones < 0) return 'down';
  return 'static';
}

export function analyzeVoiceLeading(
  from: { chord: string; voicing: string[] },
  to: { chord: string; voicing: string[] },
): VoiceLeadingReport {
  if (from.voicing.length === 0 || to.voicing.length === 0) {
    throw new MusicInputError('Voicings must have non-zero length.');
  }
  if (from.voicing.length !== to.voicing.length) {
    throw new MusicInputError('Voicings must have equal length (paired by index).');
  }

  const fromMidi = from.voicing.map(midiOf);
  const toMidi = to.voicing.map(midiOf);

  const perVoice: VoiceMove[] = from.voicing.map((f, i) => {
    const t = to.voicing[i] ?? '';
    const a = fromMidi[i] ?? 0;
    const b = toMidi[i] ?? 0;
    const semitones = b - a;
    return { from: f, to: t, semitones, direction: directionOf(semitones) };
  });

  const warnings: VoiceWarning[] = [];

  for (let i = 0; i < perVoice.length; i++) {
    const move = perVoice[i];
    if (move !== undefined && Math.abs(move.semitones) > 12) {
      warnings.push({ type: 'large-leap', voice: i, semitones: move.semitones });
    }
  }

  for (let i = 0; i < fromMidi.length; i++) {
    for (let j = i + 1; j < fromMidi.length; j++) {
      const fi = fromMidi[i];
      const fj = fromMidi[j];
      const ti = toMidi[i];
      const tj = toMidi[j];
      const mi = perVoice[i];
      const mj = perVoice[j];
      if (
        fi === undefined ||
        fj === undefined ||
        ti === undefined ||
        tj === undefined ||
        mi === undefined ||
        mj === undefined
      ) {
        continue;
      }
      if (mi.direction === 'static' || mj.direction === 'static') continue;
      if (mi.direction !== mj.direction) continue;
      const fromDiff = Math.abs(fi - fj);
      const toDiff = Math.abs(ti - tj);
      const fromMod = fromDiff % 12;
      const toMod = toDiff % 12;

      if (fromMod === 7 && toMod === 7) {
        warnings.push({ type: 'parallel-fifths', voices: [i, j] });
      } else if (fromMod === 0 && toMod === 0 && fromDiff !== 0 && toDiff !== 0) {
        warnings.push({ type: 'parallel-octaves', voices: [i, j] });
      }
    }
  }

  return { perVoice, warnings };
}
