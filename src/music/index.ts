export { MusicInputError } from './errors.js';
export { getNoteInfo, type NoteInfo } from './notes.js';
export { getInterval, type IntervalInfo } from './intervals.js';
export { getScale, type ScaleInfo } from './scales.js';
export { parseChordSymbol, type ChordInfo } from './chords.js';
export {
  transposeSubject,
  type TransposeBy,
  type TransposeInput,
  type TransposeResult,
} from './transpose.js';
export { getKeyDetails, type DiatonicChord, type KeyInfo, type KeyMode } from './keys.js';
export {
  chordQualityKey,
  keyDiatonicPCs,
  keyDiatonicTriads,
  keyScale,
  notesPCs,
  pcOf,
  rootPC,
  type PCSet,
  type QualityKey,
} from './pitchClass.js';
export {
  detectKey,
  scoreKeyForChords,
  scoreKeyForNotes,
  type KeyCandidate,
} from './keyDetection.js';
export {
  chordToRoman,
  labelProgression,
  type RomanFunction,
  type RomanKey,
  type RomanLabel,
} from './romanAnalysis.js';
export { findCadences, type Cadence, type CadenceType } from './cadences.js';
export {
  analyzeProgression,
  parseKeyString,
  transposeProgression,
  type Modulation,
  type ProgressionAnalysis,
} from './progressions.js';
export { suggestSubstitutions, type SubstitutionResult } from './substitutions.js';
export {
  analyzeVoiceLeading,
  type VoiceLeadingReport,
  type VoiceMove,
  type VoiceWarning,
} from './voiceLeading.js';
