import { findCadences, type Cadence } from './cadences.js';
import { MusicInputError } from './errors.js';
import { detectKey } from './keyDetection.js';
import { labelProgression } from './romanAnalysis.js';
import { transposeSubject, type TransposeBy } from './transpose.js';

export type Modulation = {
  fromIndex: number;
  toIndex: number;
  fromKey: string;
  toKey: string;
  pivot?: string;
};

export type ProgressionAnalysis = {
  key: string;
  romanNumerals: string[];
  cadences: Cadence[];
  modulations: Modulation[];
};

const KEY_HINT = /^([A-Ga-g][b#x]*)\s+(major|minor)$/;

export function parseKeyString(input: string): { tonic: string; mode: 'major' | 'minor' } {
  const m = KEY_HINT.exec(input.trim());
  if (m === null || m[1] === undefined || m[2] === undefined) {
    throw new MusicInputError(
      `Invalid key string: ${input}. Expected format like "C major" or "A minor".`,
    );
  }
  return { tonic: m[1], mode: m[2] as 'major' | 'minor' };
}

export function analyzeProgression(chords: string[], keyHint?: string): ProgressionAnalysis {
  if (chords.length === 0) {
    throw new MusicInputError('Cannot analyze an empty progression.');
  }
  const key = keyHint !== undefined ? parseKeyString(keyHint) : pickTopKey(chords);
  const labels = labelProgression(chords, key);
  const cadences = findCadences(labels, key.mode);
  return {
    key: `${key.tonic} ${key.mode}`,
    romanNumerals: labels.map((l) => l.roman),
    cadences,
    modulations: [],
  };
}

function pickTopKey(chords: string[]): { tonic: string; mode: 'major' | 'minor' } {
  const candidates = detectKey({ chords });
  const top = candidates[0];
  if (top === undefined) {
    throw new MusicInputError('Could not detect a key for the given progression.');
  }
  return parseKeyString(top.key);
}

export function transposeProgression(
  chords: string[],
  by: TransposeBy,
): { chords: string[]; interval: string } {
  if (chords.length === 0) {
    throw new MusicInputError('Cannot transpose an empty progression.');
  }
  const result = transposeSubject(chords, by);
  if (result.kind !== 'chords' || !Array.isArray(result.value)) {
    throw new MusicInputError('Unexpected transpose result for chord array.');
  }
  return { chords: result.value, interval: result.interval };
}
